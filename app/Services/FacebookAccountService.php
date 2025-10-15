<?php

namespace App\Services;

use App\Models\FacebookAccount;
use App\Models\User;
use App\Queries\BaseQuery;
use App\Repositories\FacebookAccountRepositoryInterface;
use Illuminate\Http\Request;

class FacebookAccountService
{
    protected $repository;

    public function __construct(FacebookAccountRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function getAll(Request $request)
    {
        $query = $this->repository->getModel()->newQuery();

        $query->with([
            'device',
            'interactionScenario',
            'proxy:id,name,host,port,type,status,country,city',
        ]);

        // Apply custom filters before BaseQuery
        $this->applyCustomFilters($query, $request);

        return (new BaseQuery($query, $request))->paginate();
    }

    protected function applyCustomFilters($query, Request $request)
    {
        // Handle proxy_status filter
        if ($request->has('filter[proxy_status]') && !empty($request->input('filter[proxy_status]'))) {
            $proxyStatus = $request->input('filter[proxy_status]');

            switch ($proxyStatus) {
                case 'has_proxy':
                    $query->whereHas('proxy');
                    break;
                case 'no_proxy':
                    $query->whereDoesntHave('proxy');
                    break;
                case 'active_proxy':
                    $query->whereHas('proxy', function($q) {
                        $q->where('status', 'active');
                    });
                    break;
                case 'error_proxy':
                    $query->whereHas('proxy', function($q) {
                        $q->where('status', 'error');
                    });
                    break;
                case 'inactive_proxy':
                    $query->whereHas('proxy', function($q) {
                        $q->where('status', 'inactive');
                    });
                    break;
            }
        }
    }

    public function getStatistics(User $user): array
    {
        $query = FacebookAccount::query();
        if (!$user->hasRole('super-admin')) {
            $query->where('user_id', $user->id);
        }

        $total = $query->count();
        $active = (clone $query)->where('status', 'active')->count();
        $inactive = (clone $query)->where('status', 'inactive')->count();

        return [
            'totalAccounts' => $total,
            'activeAccounts' => $active,
            'inactiveAccounts' => $inactive,
            'runningTasks' => $active,
            'totalAccountsChange' => null,
            'totalAccountsChangeType' => 'neutral',
            'activeAccountsChange' => null,
            'activeAccountsChangeType' => 'neutral',
            'inactiveAccountsChange' => null,
            'inactiveAccountsChangeType' => 'neutral',
            'runningTasksChange' => null,
            'runningTasksChangeType' => 'neutral',
        ];
    }

    public function create(array $data): FacebookAccount
    {
        return $this->repository->create($data);
    }

    public function update(FacebookAccount $account, array $data): FacebookAccount
    {
        $fillableFields = $account->getFillable();
        $filtered = array_intersect_key($data, array_flip($fillableFields));
        return $this->repository->update($account, $filtered);
    }

    public function delete(FacebookAccount $account): bool
    {
        return $this->repository->delete($account);
    }

    public function import(array $data): array
    {
        $lines = preg_split('/\r?\n/', $data['accountList'] ?? '');
        $imported = 0; $failed = 0; $importedAccounts = []; $failedAccounts = [];
        foreach ($lines as $i => $line) {
            $line = trim($line);
            if ($line === '') continue;
            $parts = explode('|', $line);
            try {
                if (count($parts) < 2) {
                    throw new \InvalidArgumentException('Format không đúng, cần UID|PASS|2FA|MAIL hoặc username|email|password');
                }
                // Ưu tiên format mới: UID|PASS|2FA|MAIL
                if (($data['format'] ?? 'new') === 'new') {
                    $uid = trim($parts[0]);
                    $password = trim($parts[1]);
                    $email = isset($parts[3]) ? trim($parts[3]) : ($uid.'@facebook.com');
                    if (strlen($uid) < 3 || strlen($password) < 6) {
                        throw new \InvalidArgumentException('UID hoặc Password không hợp lệ');
                    }
                    $payload = [
                        'user_id' => $data['user_id'] ?? null,
                        'username' => $uid,
                        'email' => $email,
                        'password' => $password,
                        'status' => ($data['enableRunningStatus'] ?? true) ? 'active' : 'inactive',
                        'device_id' => $data['deviceId'] ?? null,
                        'scenario_id' => $data['scenarioId'] ?? null,
                        'proxy_id' => $data['proxyId'] ?? null,
                        'connection_type' => $data['connectionType'] ?? 'wifi',
                    ];
                } else {
                    // Legacy: username|email|password|phone
                    if (count($parts) < 3) {
                        throw new \InvalidArgumentException('Legacy format không đúng');
                    }
                    $payload = [
                        'user_id' => $data['user_id'] ?? null,
                        'username' => trim($parts[0]),
                        'email' => trim($parts[1]),
                        'password' => trim($parts[2]),
                        'phone_number' => isset($parts[3]) ? trim($parts[3]) : null,
                        'status' => ($data['enableRunningStatus'] ?? true) ? 'active' : 'inactive',
                        'device_id' => $data['deviceId'] ?? null,
                        'scenario_id' => $data['scenarioId'] ?? null,
                        'proxy_id' => $data['proxyId'] ?? null,
                        'connection_type' => $data['connectionType'] ?? 'wifi',
                    ];
                }

                $account = $this->repository->create($payload);
                $imported++;
                $importedAccounts[] = [
                    'id' => $account->id,
                    'username' => $account->username,
                    'email' => $account->email,
                    'status' => $account->status,
                ];
            } catch (\Throwable $e) {
                $failed++;
                $failedAccounts[] = [
                    'line' => $i + 1,
                    'content' => $line,
                    'error' => $e->getMessage(),
                ];
            }
        }

        $total = $imported + $failed;
        return [
            'success' => $imported > 0,
            'message' => "Đã xử lý {$total} dòng: {$imported} thành công, {$failed} thất bại",
            'data' => compact('imported','failed','total','importedAccounts','failedAccounts'),
        ];
    }

    public function updateConnectionType(FacebookAccount $account, string $type): FacebookAccount
    {
        return $this->update($account, ['connection_type' => $type]);
    }

    public function bulkUpdateConnectionType(User $user, array $ids, string $type): array
    {
        $query = FacebookAccount::whereIn('id', $ids);
        if (!$user->hasRole('super-admin')) {
            $query->where('user_id', $user->id);
        }
        $updated = $query->update(['connection_type' => $type]);
        return [
            'updated_count' => $updated,
            'failed_count' => count($ids) - $updated,
        ];
    }
}


