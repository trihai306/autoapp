<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SettingController extends Controller
{
    public function index()
    {
        $settingsFromDb = Auth::user()->settings()->pluck('value', 'key')->all();
        $settings = [];
        foreach ($settingsFromDb as $key => $value) {
            $decodedValue = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $settings[$key] = $decodedValue;
            } else {
                $settings[$key] = $value;
            }
        }
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        foreach ($request->all() as $key => $value) {
            $user->settings()->updateOrCreate(
                ['key' => $key],
                ['value' => json_encode($value)]
            );
        }

        return response()->json(['message' => 'Settings updated successfully.']);
    }
}
