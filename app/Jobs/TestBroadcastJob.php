<?php

namespace App\Jobs;

use App\Events\TaskDispatchedToDevice;
use App\Models\AccountTask;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class TestBroadcastJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $task;
    public $testData;

    /**
     * Create a new job instance.
     */
    public function __construct(AccountTask $task, array $testData = [])
    {
        $this->task = $task;
        $this->testData = $testData;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('TestBroadcastJob: Starting broadcast', [
                'task_id' => $this->task->id,
                'device_id' => $this->task->device_id,
                'test_data' => $this->testData
            ]);

            // Broadcast the event
            event(new TaskDispatchedToDevice($this->task));

            Log::info('TestBroadcastJob: Broadcast completed successfully', [
                'task_id' => $this->task->id,
                'channel' => 'device.' . $this->task->device_id,
                'event' => 'device.task.created'
            ]);

        } catch (\Exception $e) {
            Log::error('TestBroadcastJob: Broadcast failed', [
                'task_id' => $this->task->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('TestBroadcastJob: Job failed', [
            'task_id' => $this->task->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}
