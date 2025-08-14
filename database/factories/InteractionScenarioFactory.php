<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InteractionScenario>
 */
class InteractionScenarioFactory extends Factory
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
            'name' => $this->faker->sentence,
            'description' => $this->faker->paragraph,
            'settings' => json_encode([
                'actions' => [
                    ['type' => 'like', 'delay' => $this->faker->numberBetween(1, 5)],
                    ['type' => 'comment', 'text' => $this->faker->sentence, 'delay' => $this->faker->numberBetween(1, 5)],
                ]
            ]),
        ];
    }
}
