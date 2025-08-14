<?php

namespace Database\Factories;

use App\Models\Device;
use App\Models\TiktokAccount;
use App\Models\InteractionScenario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AccountTask>
 */
class AccountTaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $account = TiktokAccount::inRandomOrder()->first();
        
        return [
            'tiktok_account_id' => $account?->id,
            'interaction_scenario_id' => $account?->scenario_id, // Sử dụng scenario của account
            'device_id' => Device::inRandomOrder()->first()->id ?? null,
            'task_type' => $this->faker->randomElement(['like', 'comment', 'follow', 'share']),
            'parameters' => json_encode(['url' => $this->faker->url]),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high']),
            'status' => $this->faker->randomElement(['pending', 'running', 'completed', 'failed']),
            'result' => null,
            'error_message' => null,
            'retry_count' => 0,
            'max_retries' => $this->faker->numberBetween(1, 5),
            'scheduled_at' => $this->faker->dateTimeBetween('now', '+1 month'),
            'started_at' => null,
            'completed_at' => null,
        ];
    }
}
