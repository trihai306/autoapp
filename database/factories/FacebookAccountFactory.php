<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\FacebookAccount;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FacebookAccount>
 */
class FacebookAccountFactory extends Factory
{
    protected $model = FacebookAccount::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $username = $this->faker->unique()->userName();
        return [
            'user_id' => null,
            'username' => $username,
            'email' => $this->faker->unique()->safeEmail(),
            'password' => 'password',
            'phone_number' => $this->faker->optional()->phoneNumber(),
            'status' => $this->faker->randomElement(['active','inactive','suspended']),
            'device_id' => null,
            'proxy_id' => null,
            'scenario_id' => null,
            'follower_count' => $this->faker->numberBetween(0, 100000),
            'heart_count' => $this->faker->numberBetween(0, 500000),
            'video_count' => $this->faker->numberBetween(0, 1000),
            'estimated_views' => $this->faker->numberBetween(0, 1000000),
            'two_factor_enabled' => $this->faker->boolean(20),
            'two_factor_backup_codes' => null,
            'connection_type' => $this->faker->randomElement(['wifi','4g']),
            'notes' => $this->faker->optional()->sentence(8),
            'device_info' => $this->faker->optional()->userAgent(),
            'last_activity' => $this->faker->optional()->dateTimeBetween('-30 days','now'),
        ];
    }
}
