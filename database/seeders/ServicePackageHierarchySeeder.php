<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServicePackageCategory;
use App\Models\ServicePackage;
use App\Models\ServicePackageTier;

class ServicePackageHierarchySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo các categories (gói chính)
        $categories = [
            [
                'name' => 'Facebook',
                'slug' => 'facebook',
                'description' => 'Gói dịch vụ cho Facebook Marketing',
                'icon' => 'fab fa-facebook',
                'color' => '#1877F2',
                'is_active' => true,
                'sort_order' => 1,
                'settings' => [
                    'platform' => 'facebook',
                    'features' => ['posting', 'scheduling', 'analytics'],
                    'api_required' => true,
                ],
            ],
            [
                'name' => 'Instagram',
                'slug' => 'instagram',
                'description' => 'Gói dịch vụ cho Instagram Marketing',
                'icon' => 'fab fa-instagram',
                'color' => '#E4405F',
                'is_active' => true,
                'sort_order' => 2,
                'settings' => [
                    'platform' => 'instagram',
                    'features' => ['posting', 'stories', 'reels', 'analytics'],
                    'api_required' => true,
                ],
            ],
            [
                'name' => 'TikTok',
                'slug' => 'tiktok',
                'description' => 'Gói dịch vụ cho TikTok Marketing',
                'icon' => 'fab fa-tiktok',
                'color' => '#000000',
                'is_active' => true,
                'sort_order' => 3,
                'settings' => [
                    'platform' => 'tiktok',
                    'features' => ['video_upload', 'scheduling', 'analytics'],
                    'api_required' => true,
                ],
            ],
        ];

        foreach ($categories as $categoryData) {
            $category = ServicePackageCategory::create($categoryData);
            
            // Tạo packages cho mỗi category (3 tháng, 6 tháng, 1 năm)
            $packages = [
                [
                    'name' => $category->name . ' - 3 tháng',
                    'slug' => $category->slug . '-3-thang',
                    'description' => 'Gói ' . $category->name . ' trong 3 tháng',
                    'duration_type' => 'months',
                    'duration_value' => 3,
                    'platform' => $category->settings['platform'],
                    'platform_settings' => $category->settings,
                    'is_active' => true,
                    'is_popular' => false,
                    'sort_order' => 1,
                    'features' => $category->settings['features'],
                    'limits' => [
                        'max_posts_per_day' => 50,
                        'max_accounts' => 5,
                    ],
                    'icon' => $category->icon,
                    'color' => $category->color,
                ],
                [
                    'name' => $category->name . ' - 6 tháng',
                    'slug' => $category->slug . '-6-thang',
                    'description' => 'Gói ' . $category->name . ' trong 6 tháng',
                    'duration_type' => 'months',
                    'duration_value' => 6,
                    'platform' => $category->settings['platform'],
                    'platform_settings' => $category->settings,
                    'is_active' => true,
                    'is_popular' => true, // Gói 6 tháng là phổ biến
                    'sort_order' => 2,
                    'features' => $category->settings['features'],
                    'limits' => [
                        'max_posts_per_day' => 100,
                        'max_accounts' => 10,
                    ],
                    'icon' => $category->icon,
                    'color' => $category->color,
                ],
                [
                    'name' => $category->name . ' - 1 năm',
                    'slug' => $category->slug . '-1-nam',
                    'description' => 'Gói ' . $category->name . ' trong 1 năm',
                    'duration_type' => 'years',
                    'duration_value' => 1,
                    'platform' => $category->settings['platform'],
                    'platform_settings' => $category->settings,
                    'is_active' => true,
                    'is_popular' => false,
                    'sort_order' => 3,
                    'features' => $category->settings['features'],
                    'limits' => [
                        'max_posts_per_day' => 200,
                        'max_accounts' => 20,
                    ],
                    'icon' => $category->icon,
                    'color' => $category->color,
                ],
            ];

            foreach ($packages as $packageData) {
                $packageData['category_id'] = $category->id;
                $package = ServicePackage::create($packageData);
                
                // Tạo tiers cho mỗi package (số lượng thiết bị khác nhau)
                $tiers = [
                    [
                        'name' => 'Basic',
                        'slug' => 'basic',
                        'description' => 'Gói cơ bản với số lượng thiết bị hạn chế',
                        'device_limit' => 5,
                        'price' => $this->calculatePrice($package->duration_value, $package->duration_type, 5),
                        'currency' => 'VND',
                        'is_popular' => false,
                        'is_active' => true,
                        'sort_order' => 1,
                        'features' => [
                            'basic_analytics',
                            'standard_support',
                            'basic_templates',
                        ],
                        'limits' => [
                            'max_posts_per_day' => 10,
                            'max_scheduled_posts' => 50,
                        ],
                    ],
                    [
                        'name' => 'Pro',
                        'slug' => 'pro',
                        'description' => 'Gói chuyên nghiệp với nhiều tính năng',
                        'device_limit' => 15,
                        'price' => $this->calculatePrice($package->duration_value, $package->duration_type, 15),
                        'currency' => 'VND',
                        'is_popular' => true, // Gói Pro là phổ biến
                        'is_active' => true,
                        'sort_order' => 2,
                        'features' => [
                            'advanced_analytics',
                            'priority_support',
                            'premium_templates',
                            'auto_posting',
                        ],
                        'limits' => [
                            'max_posts_per_day' => 50,
                            'max_scheduled_posts' => 500,
                        ],
                    ],
                    [
                        'name' => 'Enterprise',
                        'slug' => 'enterprise',
                        'description' => 'Gói doanh nghiệp với không giới hạn',
                        'device_limit' => 50,
                        'price' => $this->calculatePrice($package->duration_value, $package->duration_type, 50),
                        'currency' => 'VND',
                        'is_popular' => false,
                        'is_active' => true,
                        'sort_order' => 3,
                        'features' => [
                            'enterprise_analytics',
                            'dedicated_support',
                            'custom_templates',
                            'auto_posting',
                            'team_collaboration',
                            'white_label',
                        ],
                        'limits' => [
                            'max_posts_per_day' => -1, // Không giới hạn
                            'max_scheduled_posts' => -1, // Không giới hạn
                        ],
                    ],
                ];

                foreach ($tiers as $tierData) {
                    $tierData['service_package_id'] = $package->id;
                    ServicePackageTier::create($tierData);
                }
            }
        }
    }

    /**
     * Tính giá dựa trên thời gian và số lượng thiết bị
     */
    private function calculatePrice(int $durationValue, string $durationType, int $deviceLimit): float
    {
        $basePrice = 100000; // Giá cơ bản 100k VND
        $deviceMultiplier = $deviceLimit / 5; // Mỗi 5 thiết bị tăng 1 lần giá
        $durationMultiplier = 1;

        if ($durationType === 'months') {
            $durationMultiplier = $durationValue;
        } elseif ($durationType === 'years') {
            $durationMultiplier = $durationValue * 12;
        }

        return $basePrice * $deviceMultiplier * $durationMultiplier;
    }
}