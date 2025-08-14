<?php

namespace App\Queries;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BaseQuery
{
    protected $builder;
    protected $request;

    public function __construct(Builder|Relation $builder, Request $request)
    {
        $this->builder = $builder;
        $this->request = $request;
    }

    public static function for(Builder|Relation $builder, Request $request)
    {
        return new static($builder, $request);
    }

    public function handle()
    {
        $this->applySearch()
            ->applyFilters()
            ->applySorts();


        return $this->builder;
    }

    public function paginate(int $defaultPerPage = 10)
    {
        $perPage = $this->request->input('per_page', $defaultPerPage);
        return $this->handle()->paginate($perPage);
    }

    protected function applySearch(): self
    {


        if ($this->request->has('search') && !empty($this->request->input('search'))) {
            $searchableFields = $this->builder->getModel()->searchable ?? [];
            $searchTerm = $this->request->input('search');


            if (!empty($searchableFields)) {
                $this->builder->where(function (Builder $query) use ($searchableFields, $searchTerm) {
                    foreach ($searchableFields as $field) {
                        $query->orWhere($field, 'LIKE', "%{$searchTerm}%");
                    }
                });
            }
        }

        return $this;
    }

    protected function applyFilters(): self
    {
        $filterableFields = $this->builder->getModel()->filterable ?? [];
        
        // Apply filters from 'filter' parameter (object format)
        if ($this->request->has('filter') && is_array($this->request->input('filter'))) {
            foreach ($this->request->input('filter') as $field => $value) {
                if (in_array($field, $filterableFields) && !empty($value)) {
                    $this->builder->where($field, $value);
                }
            }
        }

        // Apply filters from 'filter[field_name]' format
        foreach ($this->request->all() as $field => $value) {
            if (str_starts_with($field, 'filter[') && !empty($value)) {
                $actualField = str_replace(['filter[', ']'], '', $field);
                if (in_array($actualField, $filterableFields)) {
                    $this->builder->where($actualField, $value);
                }
            }
        }

        // Apply direct filters from request parameters (like user_id)
        foreach ($this->request->all() as $field => $value) {
            if (in_array($field, $filterableFields) && !empty($value) && !in_array($field, ['page', 'per_page', 'search', 'sort', 'filter']) && !str_starts_with($field, 'filter[')) {
                $this->builder->where($field, $value);
            }
        }

        return $this;
    }

    protected function applySorts(): self
    {
        if ($this->request->has('sort')) {
            $sortableFields = $this->builder->getModel()->sortable ?? [];
            $sorts = explode(',', $this->request->input('sort'));

            foreach ($sorts as $sort) {
                $direction = Str::startsWith($sort, '-') ? 'desc' : 'asc';
                $field = ltrim($sort, '-');

                if (in_array($field, $sortableFields)) {
                    $this->builder->orderBy($field, $direction);
                }
            }
        }

        return $this;
    }
}
