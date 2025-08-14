<?php

namespace App\Services;

use App\Models\ContentGroup;
use App\Queries\BaseQuery;
use App\Repositories\ContentGroupRepositoryInterface;
use Illuminate\Http\Request;

class ContentGroupService
{
    protected $contentGroupRepository;

    public function __construct(ContentGroupRepositoryInterface $contentGroupRepository)
    {
        $this->contentGroupRepository = $contentGroupRepository;
    }

    public function getAllContentGroups(Request $request)
    {
        $query = $this->contentGroupRepository->getModel()->query()->with('user')->withCount('contents');

        if (!$request->has('sort')) {
            $query->latest();
        }
        
        return BaseQuery::for($query, $request)->paginate();
    }

    public function findContentGroupById(int $id): ?ContentGroup
    {
        return $this->contentGroupRepository->findWithContentsCount($id);
    }

    public function getContentGroupsByUserId(int $userId)
    {
        return $this->contentGroupRepository->getByUserId($userId);
    }

    public function createContentGroup(array $data): ContentGroup
    {
        $contentGroup = $this->contentGroupRepository->create($data);
        return $contentGroup->load('user')->loadCount('contents');
    }

    public function updateContentGroup(ContentGroup $contentGroup, array $data): ContentGroup
    {
        $this->contentGroupRepository->update($contentGroup, $data);
        return $contentGroup->fresh()->load('user')->loadCount('contents');
    }

    public function deleteContentGroup(ContentGroup $contentGroup): bool
    {
        return $this->contentGroupRepository->delete($contentGroup);
    }

    public function deleteMultiple(array $contentGroupIds): int
    {
        return $this->contentGroupRepository->deleteByIds($contentGroupIds);
    }

    public function updateMultiple(array $contentGroupIds, array $data): int
    {
        return $this->contentGroupRepository->updateByIds($contentGroupIds, $data);
    }
}
