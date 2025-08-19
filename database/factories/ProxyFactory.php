<?php

namespace Database\Factories;

use App\Models\Proxy;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Proxy>
 */
class ProxyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['http', 'https', 'socks4', 'socks5'];
        $statuses = ['active', 'inactive', 'error'];
        
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->word() . ' Proxy',
            'host' => $this->faker->ipv4(),
            'port' => $this->faker->numberBetween(1000, 9999),
            'username' => $this->faker->optional()->userName(),
            'password' => $this->faker->optional()->password(),
            'type' => $this->faker->randomElement($types),
            'status' => $this->faker->randomElement($statuses),
            'country' => $this->faker->optional()->country(),
            'city' => $this->faker->optional()->city(),
            'notes' => $this->faker->optional()->sentence(),
            'last_used_at' => $this->faker->optional()->dateTimeThisMonth(),
            'last_tested_at' => $this->faker->optional()->dateTimeBetween('-1 week', 'now'),
        ];
    }

    /**
     * Indicate that the proxy is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    /**
     * Indicate that the proxy is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    /**
     * Indicate that the proxy has authentication.
     */
    public function withAuth(): static
    {
        return $this->state(fn (array $attributes) => [
            'username' => $this->faker->userName(),
            'password' => $this->faker->password(),
        ]);
    }
}
