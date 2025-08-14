<?php

namespace App\Console\Commands;

use App\Events\TiktokAccountTableReload;
use App\Models\User;
use Illuminate\Console\Command;

class ReloadTiktokAccountTableCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tiktok:reload-table 
                            {--user-id= : User ID để gửi private channel}
                            {--message= : Custom message cho event}
                            {--all : Gửi cho tất cả users (public channel)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Bắn event reload TikTok account table cho user chỉ định hoặc tất cả users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user-id');
        $message = $this->option('message');
        $sendToAll = $this->option('all');

        if ($sendToAll) {
            // Gửi public channel cho tất cả users
            $this->info('🔄 Broadcasting reload event to all users (public channel)...');
            
            event(new TiktokAccountTableReload(
                $message ?? 'TikTok account table has been updated for all users'
            ));
            
            $this->info('✅ Event sent to public channel: tiktok-accounts');
            return 0;
        }

        if (!$userId) {
            $this->error('❌ Please specify --user-id or use --all flag');
            $this->info('Usage examples:');
            $this->info('  php artisan tiktok:reload-table --user-id=1');
            $this->info('  php artisan tiktok:reload-table --user-id=1 --message="Custom message"');
            $this->info('  php artisan tiktok:reload-table --all');
            return 1;
        }

        // Kiểm tra user có tồn tại không
        $user = User::find($userId);
        if (!$user) {
            $this->error("❌ User with ID {$userId} not found");
            return 1;
        }

        $this->info("🔄 Broadcasting reload event to user: {$user->name} (ID: {$userId})...");
        
        // Gửi private channel cho user cụ thể
        event(new TiktokAccountTableReload(
            $message ?? "TikTok account table has been updated for user {$user->name}",
            $userId
        ));
        
        $this->info("✅ Event sent to private channel: user.{$userId}.tiktok-accounts");
        $this->info("📧 Message: " . ($message ?? "TikTok account table has been updated for user {$user->name}"));
        
        return 0;
    }
}
