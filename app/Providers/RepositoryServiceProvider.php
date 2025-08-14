<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\BaseRepositoryInterface;
use App\Repositories\Eloquent\BaseRepository;
use App\Repositories\UserRepositoryInterface;
use App\Repositories\Eloquent\UserRepository;
use App\Repositories\AISpendingHistoryRepositoryInterface;
use App\Repositories\Eloquent\AISpendingHistoryRepository;
use App\Repositories\Notification\NotificationRepository;
use App\Repositories\Notification\NotificationRepositoryInterface;
use App\Repositories\RoleRepositoryInterface;
use App\Repositories\Eloquent\RoleRepository;
use App\Repositories\PermissionRepositoryInterface;
use App\Repositories\Eloquent\PermissionRepository;
use App\Repositories\TransactionRepositoryInterface;
use App\Repositories\Eloquent\TransactionRepository;
use App\Repositories\TransactionAnalyticRepositoryInterface;
use App\Repositories\Eloquent\TransactionAnalyticRepository;
use App\Repositories\InteractionScenarioRepositoryInterface;
use App\Repositories\Eloquent\InteractionScenarioRepository;
use App\Repositories\ScenarioScriptRepositoryInterface;
use App\Repositories\Eloquent\ScenarioScriptRepository;
use App\Repositories\AccountTaskRepositoryInterface;
use App\Repositories\Eloquent\AccountTaskRepository;
use App\Repositories\DeviceRepositoryInterface;
use App\Repositories\Eloquent\DeviceRepository;
use App\Repositories\TiktokAccountRepositoryInterface;
use App\Repositories\Eloquent\TiktokAccountRepository;
use App\Repositories\ContentGroupRepositoryInterface;
use App\Repositories\Eloquent\ContentGroupRepository;
use App\Repositories\ContentRepositoryInterface;
use App\Repositories\Eloquent\ContentRepository;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(BaseRepositoryInterface::class, BaseRepository::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(AISpendingHistoryRepositoryInterface::class, AISpendingHistoryRepository::class);
        $this->app->bind(NotificationRepositoryInterface::class, NotificationRepository::class);
        $this->app->bind(RoleRepositoryInterface::class, RoleRepository::class);
        $this->app->bind(PermissionRepositoryInterface::class, PermissionRepository::class);
        $this->app->bind(TransactionRepositoryInterface::class, TransactionRepository::class);
        $this->app->bind(TransactionAnalyticRepositoryInterface::class, TransactionAnalyticRepository::class);
        $this->app->bind(InteractionScenarioRepositoryInterface::class, InteractionScenarioRepository::class);
        $this->app->bind(ScenarioScriptRepositoryInterface::class, ScenarioScriptRepository::class);
        $this->app->bind(AccountTaskRepositoryInterface::class, AccountTaskRepository::class);
        $this->app->bind(DeviceRepositoryInterface::class, DeviceRepository::class);
        $this->app->bind(TiktokAccountRepositoryInterface::class, TiktokAccountRepository::class);
        $this->app->bind(ContentGroupRepositoryInterface::class, ContentGroupRepository::class);
        $this->app->bind(ContentRepositoryInterface::class, ContentRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
