<?php

namespace App\Console\Commands;

use App\Events\TaskDispatchedToDevice;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TestBroadcastingCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:broadcasting {device_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test broadcasting functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $deviceId = $this->argument('device_id') ?? 'test-device-123';

        $this->info("🧪 Testing broadcasting with device ID: {$deviceId}");

        try {
            // Test 1: Direct event dispatch (synchronous)
            $this->info("📡 Test 1: Direct event dispatch...");
            event(new TaskDispatchedToDevice($deviceId));
            $this->info("✅ Direct event dispatch completed");

            // Test 2: Check broadcasting configuration
            $this->info("🔧 Test 2: Broadcasting configuration...");
            $broadcastDriver = config('broadcasting.default');
            $this->info("Broadcast driver: {$broadcastDriver}");

            if ($broadcastDriver === 'reverb') {
                $reverbConfig = config('broadcasting.connections.reverb');
                $this->info("Reverb host: " . ($reverbConfig['options']['host'] ?? 'not set'));
                $this->info("Reverb port: " . ($reverbConfig['options']['port'] ?? 'not set'));
                $this->info("Reverb scheme: " . ($reverbConfig['options']['scheme'] ?? 'not set'));
            }

            // Test 3: Check queue configuration
            $this->info("⚙️ Test 3: Queue configuration...");
            $queueDriver = config('queue.default');
            $this->info("Queue driver: {$queueDriver}");

            // Test 4: Check if Soketi server is running
            $this->info("🔍 Test 4: Checking Soketi server...");
            $pusherHost = config('broadcasting.connections.pusher.options.host');
            $pusherPort = config('broadcasting.connections.pusher.options.port');

            if ($pusherHost && $pusherPort) {
                $connection = @fsockopen($pusherHost, $pusherPort, $errno, $errstr, 5);
                if ($connection) {
                    $this->info("✅ Soketi server is reachable at {$pusherHost}:{$pusherPort}");
                    fclose($connection);
                } else {
                    $this->error("❌ Cannot connect to Soketi server at {$pusherHost}:{$pusherPort}");
                    $this->error("Error: {$errstr} ({$errno})");
                    $this->warn("💡 Make sure to run: ./start-soketi.sh");
                }
            } else {
                $this->warn("⚠️ Soketi configuration incomplete");
            }

            $this->info("🎉 Broadcasting test completed!");

        } catch (\Exception $e) {
            $this->error("❌ Broadcasting test failed: " . $e->getMessage());
            Log::error('TestBroadcastingCommand failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
