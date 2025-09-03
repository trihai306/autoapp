<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ServicePackage;
use App\Models\ServicePackageFeature;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServicePackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo gói miễn phí
        $freePackage = ServicePackage::create([
            'name' => 'Gói Miễn Phí',
            'slug' => 'goi-mien-phi',
            'description' => 'Gói dịch vụ cơ bản miễn phí với các tính năng hạn chế',
            'price' => 0,
            'currency' => 'VND',
            'duration_days' => null,
            'duration_months' => null,
            'duration_years' => null,
            'is_active' => true,
            'is_popular' => false,
            'sort_order' => 1,
            'icon' => 'fas fa-gift',
            'color' => '#10B981',
        ]);

        // Tạo tính năng cho gói miễn phí
        $freeFeatures = [
            ['name' => 'Quản lý tài khoản TikTok', 'type' => 'feature', 'value' => '3', 'unit' => 'tài khoản', 'is_included' => true, 'sort_order' => 1],
            ['name' => 'Tự động tương tác', 'type' => 'feature', 'value' => '100', 'unit' => 'lần/ngày', 'is_included' => true, 'sort_order' => 2],
            ['name' => 'Báo cáo thống kê cơ bản', 'type' => 'feature', 'value' => '1', 'unit' => 'báo cáo', 'is_included' => true, 'sort_order' => 3],
            ['name' => 'Hỗ trợ qua email', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 4],
        ];

        foreach ($freeFeatures as $feature) {
            ServicePackageFeature::create(array_merge($feature, ['service_package_id' => $freePackage->id]));
        }

        // Tạo gói cơ bản
        $basicPackage = ServicePackage::create([
            'name' => 'Gói Cơ Bản',
            'slug' => 'goi-co-ban',
            'description' => 'Gói dịch vụ cơ bản với nhiều tính năng hơn',
            'price' => 299000,
            'currency' => 'VND',
            'duration_days' => null,
            'duration_months' => 1,
            'duration_years' => null,
            'is_active' => true,
            'is_popular' => false,
            'sort_order' => 2,
            'icon' => 'fas fa-star',
            'color' => '#3B82F6',
        ]);

        // Tạo tính năng cho gói cơ bản
        $basicFeatures = [
            ['name' => 'Quản lý tài khoản TikTok', 'type' => 'feature', 'value' => '10', 'unit' => 'tài khoản', 'is_included' => true, 'sort_order' => 1],
            ['name' => 'Tự động tương tác', 'type' => 'feature', 'value' => '500', 'unit' => 'lần/ngày', 'is_included' => true, 'sort_order' => 2],
            ['name' => 'Báo cáo thống kê chi tiết', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 3],
            ['name' => 'Hỗ trợ 24/7', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 4],
            ['name' => 'Tự động đăng bài', 'type' => 'feature', 'value' => '50', 'unit' => 'bài/tháng', 'is_included' => true, 'sort_order' => 5],
        ];

        foreach ($basicFeatures as $feature) {
            ServicePackageFeature::create(array_merge($feature, ['service_package_id' => $basicPackage->id]));
        }

        // Tạo gói chuyên nghiệp
        $proPackage = ServicePackage::create([
            'name' => 'Gói Chuyên Nghiệp',
            'slug' => 'goi-chuyen-nghiep',
            'description' => 'Gói dịch vụ chuyên nghiệp với đầy đủ tính năng',
            'price' => 599000,
            'currency' => 'VND',
            'duration_days' => null,
            'duration_months' => 1,
            'duration_years' => null,
            'is_active' => true,
            'is_popular' => true,
            'sort_order' => 3,
            'icon' => 'fas fa-crown',
            'color' => '#F59E0B',
        ]);

        // Tạo tính năng cho gói chuyên nghiệp
        $proFeatures = [
            ['name' => 'Quản lý tài khoản TikTok', 'type' => 'feature', 'value' => '50', 'unit' => 'tài khoản', 'is_included' => true, 'sort_order' => 1],
            ['name' => 'Tự động tương tác', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 2],
            ['name' => 'Báo cáo thống kê nâng cao', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 3],
            ['name' => 'Hỗ trợ ưu tiên', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 4],
            ['name' => 'Tự động đăng bài', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 5],
            ['name' => 'Quản lý proxy', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 6],
            ['name' => 'API access', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 7],
        ];

        foreach ($proFeatures as $feature) {
            ServicePackageFeature::create(array_merge($feature, ['service_package_id' => $proPackage->id]));
        }

        // Tạo gói doanh nghiệp
        $enterprisePackage = ServicePackage::create([
            'name' => 'Gói Doanh Nghiệp',
            'slug' => 'goi-doanh-nghiep',
            'description' => 'Gói dịch vụ doanh nghiệp với tính năng tùy chỉnh',
            'price' => 1299000,
            'currency' => 'VND',
            'duration_days' => null,
            'duration_months' => 1,
            'duration_years' => null,
            'is_active' => true,
            'is_popular' => false,
            'sort_order' => 4,
            'icon' => 'fas fa-building',
            'color' => '#8B5CF6',
        ]);

        // Tạo tính năng cho gói doanh nghiệp
        $enterpriseFeatures = [
            ['name' => 'Quản lý tài khoản TikTok', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 1],
            ['name' => 'Tự động tương tác', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 2],
            ['name' => 'Báo cáo thống kê nâng cao', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 3],
            ['name' => 'Hỗ trợ ưu tiên cao', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 4],
            ['name' => 'Tự động đăng bài', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 5],
            ['name' => 'Quản lý proxy', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 6],
            ['name' => 'API access', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 7],
            ['name' => 'Tùy chỉnh tính năng', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 8],
            ['name' => 'Quản lý nhóm', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 9],
            ['name' => 'White-label', 'type' => 'feature', 'value' => 'unlimited', 'unit' => null, 'is_included' => true, 'sort_order' => 10],
        ];

        foreach ($enterpriseFeatures as $feature) {
            ServicePackageFeature::create(array_merge($feature, ['service_package_id' => $enterprisePackage->id]));
        }
    }
}
