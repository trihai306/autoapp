<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Transaction::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $type = $this->faker->randomElement(['deposit', 'withdrawal', 'purchase', 'refund']);
        $amount = $this->faker->numberBetween(1000, 100000);

        return [
            'user_id' => User::inRandomOrder()->first()->id,
            'type' => $type,
            'amount' => $amount,
            'status' => $this->faker->randomElement(['pending', 'completed', 'failed']),
            'description' => ucfirst($type) . ' of ' . $amount,
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => now(),
        ];
    }
}
