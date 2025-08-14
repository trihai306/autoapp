<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Notification;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $user = User::inRandomOrder()->first();
        return [
            'id' => $this->faker->uuid,
            'type' => 'App\Notifications\SimpleNotification',
            'notifiable_type' => 'App\Models\User',
            'notifiable_id' => $user->id,
            'data' => json_encode([
                'title' => $this->faker->sentence,
                'message' => $this->faker->paragraph,
            ]),
            'read_at' => $this->faker->boolean ? now() : null,
        ];
    }
}
