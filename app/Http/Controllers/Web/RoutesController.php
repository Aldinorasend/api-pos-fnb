<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class RoutesController extends Controller
{
    public function index()
    {
        return Inertia::render("Dashboard/Main", [
            "hasLogin" => Route::has("login"),
            "forgotPassword" => Route::has("password.reset"),
            "api" => env("APP_URL"),
            "csrf" => csrf_token(),
            "printer_api" => env("APP_PRINTER_URL")
        ]);
    }

    public function product()
    {
        return Inertia::render("Dashboard/ProductPage", [
            "api" => env("APP_URL"),
            "csrf" => csrf_token()
        ]);
    }

    public function category()
    {
        return Inertia::render("Dashboard/CategoryPage", [
            "api" => env("APP_URL"),
            "csrf" => csrf_token()
        ]);
    }

    public function order()
    {
        return Inertia::render("Dashboard/OrderPage", [
            "api" => env("APP_URL"),
            "printer_api" => env("APP_PRINTER_URL")
        ]);
    }

    public function payment()
    {
        return Inertia::render("Dashboard/PaymentPage", [
            "api" => env("APP_URL"),
            "printer_api" => env("APP_PRINTER_URL"),
            "csrf" => csrf_token()
        ]);
    }

    public function manageUser()
    {
        return Inertia::render("Dashboard/ManageUserPage", [
            "api" => env("APP_URL"),
            "printer_api" => env("APP_PRINTER_URL")
        ]);
    }

    public function referralCode()
    {
        return Inertia::render("Dashboard/ReferralCodePage", [
            "api" => env("APP_URL"),
            "printer_api" => env("APP_PRINTER_URL")
        ]);
    }

    public function discount()
    {
        return Inertia::render("Dashboard/DiscountPage", [
            "api" => env("APP_URL"),
            "printer_api" => env("APP_PRINTER_URL")
        ]);
    }

    public function bakeryOrder()
    {
        return Inertia::render("Dashboard/OrderBakeryPage", [
            "api" => env("APP_URL"),
            "printer_api" => env("APP_PRINTER_URL")
        ]);
    }

    public function outlet()
    {
        return Inertia::render("Dashboard/OutletPage", [
            "api" => env("APP_URL"),
            "printer_api" => env("APP_PRINTER_URL")
        ]);
    }

    public function modifier()
    {
        return Inertia::render("Dashboard/ModifierPage", [
            "api" => env("APP_URL"),
            "printer_api" => env("APP_PRINTER_URL")
        ]);
    }

    public function statistics()
    {
        return Inertia::render("Dashboard/StatisticsPage", [
            "api" => env("APP_URL"),
            "printer_api" => env("APP_PRINTER_URL")
        ]);
    }
    
}
