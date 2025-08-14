<?php

namespace Database\Seeders;

use App\Models\InteractionScenario;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InteractionScenarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        InteractionScenario::factory()->count(10)->create();
    }
}
