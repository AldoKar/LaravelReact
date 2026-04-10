<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'categories' => $request->user()
                ->categories()
                ->orderBy('name')
                ->get(['id', 'name', 'icon']),
        ]);
    }
}