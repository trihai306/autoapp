<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Device>
 */
class DeviceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::inRandomOrder()->first()->id,
            'device_name' => $this->faker->word . ' ' . $this->faker->word,
            'device_id' => $this->faker->uuid,
            'platform' => $this->faker->randomElement(['Android', 'iOS']),
            'app_version' => $this->faker->semver,
            'ip_address' => $this->faker->ipv4,
            'user_agent' => $this->faker->userAgent,
            'status' => 'active',
            'last_active_at' => now(),
        ];
    }
}
