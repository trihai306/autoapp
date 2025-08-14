<?php

namespace App\Services;

use App\Models\InteractionScenario;
use App\Queries\BaseQuery;
use App\Repositories\InteractionScenarioRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class InteractionScenarioService
{
    protected $interactionScenarioRepository;

    public function __construct(InteractionScenarioRepositoryInterface $interactionScenarioRepository)
    {
        $this->interactionScenarioRepository = $interactionScenarioRepository;
    }

    public function getAll(Request $request): LengthAwarePaginator
    {
        $query = $this->interactionScenarioRepository->getModel()->query();
        
        // Sắp xếp theo thứ tự mới nhất nếu không có sort parameter
        if (!$request->has('sort')) {
            $query->latest();
        }
        
        return BaseQuery::for($query, $request)->paginate();
    }

    public function getById(int $id): ?InteractionScenario
    {
        return $this->interactionScenarioRepository->find($id);
    }

    public function create(array $data): InteractionScenario
    {
        return $this->interactionScenarioRepository->create($data);
    }

    public function update(InteractionScenario $interactionScenario, array $data): InteractionScenario
    {
        $this->interactionScenarioRepository->update($interactionScenario, $data);
        return $interactionScenario->fresh();
    }

    public function delete(InteractionScenario $interactionScenario): bool
    {
        return $this->interactionScenarioRepository->delete($interactionScenario);
    }
}
