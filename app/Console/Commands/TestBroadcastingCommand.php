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

            // Test 4: Check if Reverb server is running
            $this->info("🔍 Test 4: Checking Reverb server...");
            $reverbHost = config('broadcasting.connections.reverb.options.host');
            $reverbPort = config('broadcasting.connections.reverb.options.port');

            if ($reverbHost && $reverbPort) {
                $connection = @fsockopen($reverbHost, $reverbPort, $errno, $errstr, 5);
                if ($connection) {
                    $this->info("✅ Reverb server is reachable at {$reverbHost}:{$reverbPort}");
                    fclose($connection);
                } else {
                    $this->error("❌ Cannot connect to Reverb server at {$reverbHost}:{$reverbPort}");
                    $this->error("Error: {$errstr} ({$errno})");
                }
            } else {
                $this->warn("⚠️ Reverb configuration incomplete");
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
