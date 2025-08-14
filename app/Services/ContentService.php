<?php

namespace App\Services;

use App\Models\Content;
use App\Queries\BaseQuery;
use App\Repositories\ContentRepositoryInterface;
use Illuminate\Http\Request;

class ContentService
{
    protected $contentRepository;

    public function __construct(ContentRepositoryInterface $contentRepository)
    {
        $this->contentRepository = $contentRepository;
    }

    public function getAllContents(Request $request)
    {
        $query = $this->contentRepository->getModel()->query()->with(['user', 'contentGroup']);

        if (!$request->has('sort')) {
            $query->latest();
        }
        
        return BaseQuery::for($query, $request)->paginate();
    }

    public function findContentById(int $id): ?Content
    {
        return $this->contentRepository->findWithRelations($id);
    }

    public function getContentsByUserId(int $userId)
    {
        return $this->contentRepository->getByUserId($userId);
    }

    public function getContentsByContentGroupId(int $contentGroupId)
    {
        return $this->contentRepository->getByContentGroupId($contentGroupId);
    }

    public function createContent(array $data): Content
    {
        $content = $this->contentRepository->create($data);
        return $content->load(['user', 'contentGroup']);
    }

    public function updateContent(Content $content, array $data): Content
    {
        $this->contentRepository->update($content, $data);
        return $content->fresh()->load(['user', 'contentGroup']);
    }

    public function deleteContent(Content $content): bool
    {
        return $this->contentRepository->delete($content);
    }

    public function deleteMultiple(array $contentIds): int
    {
        return $this->contentRepository->deleteByIds($contentIds);
    }

    public function updateMultiple(array $contentIds, array $data): int
    {
        return $this->contentRepository->updateByIds($contentIds, $data);
    }
}
