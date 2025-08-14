<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\InteractionScenario;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TiktokAccount>
 */
class TiktokAccountFactory extends Factory
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
            'username' => $this->faker->userName,
            'email' => $this->faker->email,
            'password' => 'password', // or use a hashed password
            'phone_number' => $this->faker->phoneNumber,
            'nickname' => $this->faker->name,
            'avatar_url' => $this->faker->imageUrl,
            'follower_count' => $this->faker->numberBetween(0, 1000000),
            'following_count' => $this->faker->numberBetween(0, 10000),
            'heart_count' => $this->faker->numberBetween(0, 10000000),
            'video_count' => $this->faker->numberBetween(0, 1000),
            'status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
            'scenario_id' => InteractionScenario::inRandomOrder()->first()?->id,
            'notes' => $this->faker->optional()->sentence,
            'last_login_at' => now(),
        ];
    }
}
