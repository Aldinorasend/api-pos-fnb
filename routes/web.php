<?php

use App\Http\Controllers\Web\RoutesController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::group([
    "middleware" => ["auth:sanctum"]
], function () {
    Route::prefix('/')->group(function () {
        Route::group([
            "middleware" => ["admin"]
        ], function(){
            Route::get("category", [RoutesController::class, "category"]);
            Route::get("payment", [RoutesController::class, "payment"]);
            Route::get("manageuser", [RoutesController::class, "manageUser"]);
            Route::get("referralcode", [RoutesController::class, "referralCode"]);
            Route::get("discount", [RoutesController::class, "discount"]);
            Route::get("outlet", [RoutesController::class, "outlet"]);
            Route::get("modifier", [RoutesController::class, "modifier"]);
            Route::get("statistics", [RoutesController::class, "statistics"]);
        });

        Route::get("/", [RoutesController::class, "index"]);
        Route::get("order", [RoutesController::class, "order"]);
        Route::get("product", [RoutesController::class, "product"]);
        
    });
});

Route::get('/lang/{locale}', function ($locale) {
    if (in_array($locale, ['en', 'id'])) {
        session(['locale' => $locale]);
        app()->setLocale($locale);
    }
    return redirect()->back();
});

require __DIR__ . '/auth.php';
