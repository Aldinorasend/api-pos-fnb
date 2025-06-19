<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DiscountController;
use App\Http\Controllers\Api\ModifierController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OutletController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\QRISController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group([
    "middleware" => ["cors"],
], function () {
    Route::prefix("/auth")->group(function () {
        Route::post("/", [AuthController::class, "loginUser"]);
    });
});

Route::group([
    "middleware" => ["cors", 'auth:sanctum'],
], function () {
    
    Route::resource('modifier', ModifierController::class);
    Route::prefix("modifier/ext")->group(function () {
        Route::get("outlet/{id}", [ModifierController::class, "getAllModifierByOutlet"]);
        Route::put("product/{id}", [ModifierController::class, "updateAssignedProducts"]);
        Route::get("product/{id}", [ModifierController::class, "showModifierWithAllProducts"]);
    });

    Route::resource('product', ProductController::class);
    Route::prefix("product/ext")->group(function () {
        Route::get("available", [ProductController::class, "getAllAvailableProduct"]); 
        Route::put("available/{id}", [ProductController::class, "updateProductAvailability"]);       
        Route::get("outlet/{id}", [ProductController::class, "getAllProductByOutlet"]);
    });

    Route::prefix("/category")->group(function () {
        Route::get("/", [CategoryController::class, "index"]);
        Route::get("/{id}", [CategoryController::class, "show"]);
        Route::post("/", [CategoryController::class, "store"]);
        Route::put("/{id}", [CategoryController::class, "update"]);
        Route::delete("/{id}", [CategoryController::class, "destroy"]);
        Route::get('/outlet/{outlet_id}', [CategoryController::class, 'getCategoriesByOutlet']);
    });

    Route::prefix("order")->group(function(){
        Route::get("/", [OrderController::class, "getAllOrder"]);
        Route::get("/bakery", [OrderController::class, "getAllBakeryOrder"]);
        Route::post("/", [OrderController::class, "createOrder"]);
        Route::put("/{id}", [OrderController::class, "updateOrderById"]);
        Route::delete("/{id}", [OrderController::class, "deleteOrderById"]);
        Route::get("/outlet/{id}", [OrderController::class,"getAllOrderByOutlet"]); 
        Route::get("/sold/outlet/{outletId}", [OrderController::class,"getTotalQuantitySold"]); 
        Route::get("/busy-hours/outlet/{outletId}", [OrderController::class, "getBusyHours"]);

    });

    Route::prefix("payment")->group(function () {
        Route::get("/", [PaymentController::class, "index"]);
        Route::post("/", [PaymentController::class, "store"]);
        Route::put("/{id}", [PaymentController::class, "update"]);
        Route::delete("/{id}", [PaymentController::class, "destroy"]);
    });

    Route::prefix("referralcode")->group(function(){
        Route::get("/", [ReferralController::class, "index"]);
        Route::get("/verified", [ReferralController::class, "verifiedReferralCode"]);
        Route::post("/", [ReferralController::class, "store"]);
        Route::put("/{id}", [ReferralController::class, "update"]);
        Route::delete("/{id}", [ReferralController::class, "destroy"]);
    });

    Route::group([
        "middleware" => ['admin']
    ], function(){
        Route::prefix("/user")->group(function(){
            Route::get("/", [UserController::class, "index"]);
            Route::get("/outlet", [UserController::class, "getAllUsersByOutlet"]);
            Route::post("/", [UserController::class, "store"]);
            Route::put("/{id}",[UserController::class, "update"]);
            Route::put("/{id}/status", [UserController::class, "updateUserStatus"]);
            Route::delete("/{id}", [UserController::class, "destroy"]);
        });

        Route::prefix("/roles")->group(function(){
            Route::get("/", [UserController::class, "getAllRoles"]);
        });
    });

    Route::prefix("discount")->group(function () {
        Route::get("/", [DiscountController::class, "index"]);
        Route::get("/outlet", [DiscountController::class, "getDiscountByOutlet"]);
        Route::get("/{id}", [DiscountController::class, "show"]);
        Route::post("/", [DiscountController::class, "store"]);
        Route::put("/{id}", [DiscountController::class, "update"]);
        Route::delete("/{id}", [DiscountController::class, "destroy"]);
    });    

    Route::prefix("outlet")->group(function(){
        Route::get("/" , [OutletController::class, "index"]);
        Route::post("/" , [OutletController::class, "store"]);
        Route::get("/{id}" , [OutletController::class, "show"]);
        Route::get("/current/user" , [OutletController::class, "getCurrentUserOutlet"]);
        Route::put("/{id}" , [OutletController::class, "update"]);
        Route::put("/status/{id}" , [OutletController::class, "updateOutletStatus"]);
        Route::delete("/{id}" , [OutletController::class, "destroy"]);
         
    });

    Route::prefix("customer")->group(function(){
        Route::get("/" , [OrderController::class, "getCustomers"]);
    });

});

// Route for Public
Route::group([
    "middleware" => ["cors"],
], function () {
    Route::get("/order/{id}", [OrderController::class, "getByID"]);
    Route::get("/order/show_active/{outlet_id}/{id?}", [OrderController::class, "viewOrderDetailActive"]);
    Route::get("/order/ext/statistics" , [OrderController::class, "getStatisticsEveryOutlet"]);
    Route::get("/order/ext/report" , [OrderController::class, "getTransactionReport"]);
    Route::get("/history-qris" , [QRISController::class, "fetchTransactions"]);

    Route::post("/user/send-reset-link", [UserController::class, "sendPasswordResetLink"]);
    Route::post("/user/reset-password/{token}", [UserController::class, "updatePasswordWithToken"]);
});

// Route for Mobile App
Route::group([
    "middleware" => ["api.key"],
], function () {
    Route::prefix("mobile")->group(function(){
        Route::get("/outlet" , [OutletController::class, "index"]);
        Route::get('/category/outlet/{outlet_id}', [CategoryController::class, 'getCategoriesByOutlet']);
        Route::get("/product/outlet/{id}", [ProductController::class, "getAllProductByOutlet"]);
        Route::post("/order", [OrderController::class, "createOrder"]);
    });
});
