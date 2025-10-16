<?php

namespace App\Services;

use App\Models\Proxy;
use App\Queries\BaseQuery;
use App\Repositories\ProxyRepositoryInterface;
use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProxyService
{
    protected $proxyRepository;

    public function __construct(ProxyRepositoryInterface $proxyRepository)
    {
        $this->proxyRepository = $proxyRepository;
    }

    /**
     * Get all proxies with pagination and filtering
     *
     * @param Request $request
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getAll(Request $request)
    {
        $query = $this->proxyRepository->getModel()->query()->with('user');

        if (!$request->has('sort')) {
            $query->latest();
        }

        return BaseQuery::for($query, $request)->paginate();
    }

    /**
     * Get proxies for current user
     *
     * @param Request $request
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getForUser(Request $request)
    {
        $userId = $request->user()->id;
        $query = $this->proxyRepository->getModel()->query()
            ->where('user_id', $userId);

        if (!$request->has('sort')) {
            $query->latest();
        }

        return BaseQuery::for($query, $request)->paginate();
    }

    /**
     * Find proxy by ID
     *
     * @param int $id
     * @return Proxy|null
     */
    public function findById(int $id): ?Proxy
    {
        return $this->proxyRepository->find($id);
    }

    /**
     * Create new proxy
     *
     * @param array $data
     * @return Proxy
     */
    public function create(array $data): Proxy
    {
        return $this->proxyRepository->create($data);
    }

    /**
     * Update proxy
     *
     * @param Proxy $proxy
     * @param array $data
     * @return Proxy
     */
    public function update(Proxy $proxy, array $data): Proxy
    {
        return $this->proxyRepository->update($proxy, $data);
    }

    /**
     * Delete proxy
     *
     * @param Proxy $proxy
     * @return bool
     */
    public function delete(Proxy $proxy): bool
    {
        return $this->proxyRepository->delete($proxy);
    }

    /**
     * Get active proxies for a specific user
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getActiveForUser(int $userId)
    {
        return $this->proxyRepository->getModel()->query()
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();
    }

    /**
     * Update last used timestamp
     *
     * @param Proxy $proxy
     * @return Proxy
     */
    public function updateLastUsed(Proxy $proxy): Proxy
    {
        return $this->proxyRepository->updateLastUsed($proxy);
    }

    /**
     * Update last tested timestamp
     *
     * @param Proxy $proxy
     * @return Proxy
     */
    public function updateLastTested(Proxy $proxy): Proxy
    {
        return $this->proxyRepository->updateLastTested($proxy);
    }

    /**
     * Test proxy connection
     *
     * @param Proxy $proxy
     * @return array
     */
    public function testConnection(Proxy $proxy): array
    {
        $client = new Client([
            'timeout' => 5,
            'connect_timeout' => 3,
            'http_errors' => false,
        ]);

        $proxyDsn = $proxy->full_url; // includes credentials if any

        $start = microtime(true);
        try {
            $response = $client->get('https://api.ipify.org', [
                RequestOptions::QUERY => ['format' => 'json'],
                RequestOptions::PROXY => [
                    'http' => $proxyDsn,
                    'https' => $proxyDsn,
                ],
                RequestOptions::VERIFY => false,
            ]);
            $latencyMs = (int) round((microtime(true) - $start) * 1000);

            $statusCode = $response->getStatusCode();
            $body = json_decode((string) $response->getBody(), true);
            $ip = $body['ip'] ?? null;

            $this->updateLastTested($proxy);

            if ($statusCode === 200 && !empty($ip)) {
                $this->update($proxy, [
                    'status' => 'active',
                    'last_used_at' => now(),
                    'latency_ms' => $latencyMs,
                ]);

                return [
                    'success' => true,
                    'message' => 'Proxy connection successful',
                    'data' => [
                        'success' => true,
                        'latency_ms' => $latencyMs,
                        'ip' => $ip,
                    ],
                ];
            }

            // Non-200 or missing IP -> fail
            $this->update($proxy, [
                'status' => 'error',
                'latency_ms' => null,
            ]);

            return [
                'success' => true,
                'message' => 'Proxy connection failed',
                'data' => [
                    'success' => false,
                    'latency_ms' => null,
                    'ip' => null,
                ],
            ];
        } catch (\Throwable $e) {
            // Timeout / DNS / auth errors
            $this->updateLastTested($proxy);
            $this->update($proxy, [
                'status' => 'error',
                'latency_ms' => null,
            ]);

            return [
                'success' => true,
                'message' => 'Proxy connection failed',
                'data' => [
                    'success' => false,
                    'latency_ms' => null,
                    'ip' => null,
                ],
            ];
        }
    }

    /**
     * Bulk update proxy status
     *
     * @param array $ids
     * @param string $status
     * @return int
     */
    public function updateStatusMultiple(array $ids, string $status): int
    {
        return $this->proxyRepository->updateStatusMultiple($ids, $status);
    }

    /**
     * Bulk delete proxies
     *
     * @param array $ids
     * @return int
     */
    public function deleteMultiple(array $ids): int
    {
        return $this->proxyRepository->deleteMultiple($ids);
    }

    /**
     * Import proxies from list
     *
     * @param array $data
     * @return array
     */
    public function importProxies(array $data): array
    {
        $imported = [];
        $errors = [];
        $userId = $data['user_id'] ?? Auth::id();

        foreach ($data['proxies'] as $index => $proxyData) {
            try {
                // Validate proxy data
                $validated = $this->validateProxyData($proxyData);
                $validated['user_id'] = $userId;

                // Check if proxy already exists
                $existing = $this->proxyRepository->getModel()
                    ->where('host', $validated['host'])
                    ->where('port', $validated['port'])
                    ->where('user_id', $userId)
                    ->first();

                if ($existing) {
                    $errors[] = "Proxy {$validated['host']}:{$validated['port']} already exists";
                    continue;
                }

                $proxy = $this->create($validated);
                $imported[] = $proxy;

            } catch (\Exception $e) {
                $errors[] = "Error importing proxy at index {$index}: " . $e->getMessage();
            }
        }

        return [
            'imported' => $imported,
            'errors' => $errors,
            'total_imported' => count($imported),
            'total_errors' => count($errors)
        ];
    }

    /**
     * Validate proxy data
     *
     * @param array $data
     * @return array
     */
    private function validateProxyData(array $data): array
    {
        $validated = [];

        $validated['name'] = $data['name'] ?? 'Imported Proxy';
        $validated['host'] = $data['host'] ?? $data['ip'] ?? '';
        $validated['port'] = (int) ($data['port'] ?? 8080);
        $validated['username'] = $data['username'] ?? null;
        $validated['password'] = $data['password'] ?? null;
        $validated['type'] = $data['type'] ?? 'http';
        $validated['status'] = $data['status'] ?? 'active';
        $validated['country'] = $data['country'] ?? null;
        $validated['city'] = $data['city'] ?? null;
        $validated['notes'] = $data['notes'] ?? null;

        // Validate required fields
        if (empty($validated['host'])) {
            throw new \InvalidArgumentException('Host/IP is required');
        }

        if ($validated['port'] < 1 || $validated['port'] > 65535) {
            throw new \InvalidArgumentException('Port must be between 1 and 65535');
        }

        if (!in_array($validated['type'], ['http', 'https', 'socks4', 'socks5'])) {
            throw new \InvalidArgumentException('Invalid proxy type');
        }

        if (!in_array($validated['status'], ['active', 'inactive', 'error'])) {
            throw new \InvalidArgumentException('Invalid proxy status');
        }

        return $validated;
    }

    /**
     * Get proxy statistics
     *
     * @param int $userId
     * @return array
     */
    public function getStatistics(int $userId): array
    {
        return $this->proxyRepository->getStatistics($userId);
    }
}
