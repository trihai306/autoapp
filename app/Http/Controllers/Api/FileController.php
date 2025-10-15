<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;

class FileController extends BaseController
{
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:51200', // 50MB
        ]);

        $file = $request->file('file');
        $ext = $file->getClientOriginalExtension();
        $filename = Str::uuid()->toString() . ($ext ? ('.' . $ext) : '');
        $path = $file->storeAs('uploads', $filename, 'public');

        return response()->json([
            'success' => true,
            'path' => Storage::disk('public')->url($path),
        ]);
    }
}
