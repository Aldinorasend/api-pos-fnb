<?php

namespace App\Http\Controllers\Api;
use Illuminate\Support\Facades\Validator as FacadesValidator;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Discount;
use App\Models\ModifierOption;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\OrderDetailModifier;
use App\Models\OrderDetailVariant;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ReferralCode;
use App\Models\ReferralCodeLogs;
use App\Models\TransactionLogs;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function getByID($id, Request $request)
    {
        try {
            $category = $request->query('category', null); // Default to null if not provided
    
            $order = DB::table('order')
                ->where('id', $id)
                ->latest()
                ->first();
    
            if (!$order) {
                return response()->json([
                    "message" => "Order not found",
                    "status" => "failed"
                ], 404);
            }
    
            $outlet = DB::table('outlet')
                ->where('id', $order->outlet_id)
                ->select('id', 'outlet_name')
                ->first();
    
            $customer = DB::table('customer')
                ->where('id', $order->customer_id)
                ->select('id', 'name', 'phone', 'identity')
                ->first();
    
            $orderDetails = DB::table('order_details')
                ->where('order_id', $order->id)
                ->select('id', 'order_id', 'product_id', 'quantity', 'price', 'notes')
                ->get();
    
            $orderDetails = $orderDetails->map(function ($orderDetail) use ($category) {
                $product = DB::table('products')
                    ->where('id', $orderDetail->product_id)
                    ->select('id', 'name', 'category_id')
                    ->first();
    
                if ($category) {
                    $isFood = ($category === 'food');
                    $categoryData = DB::table('category')
                        ->where('id', $product->category_id)
                        ->where('is_food', $isFood)
                        ->first();
    
                    if (!$categoryData) {
                        return null; // Exclude this orderDetail
                    }
                }
    
                $variant = DB::table('order_detail_variant')
                    ->where('order_detail_id', $orderDetail->id)
                    ->select('order_detail_id', 'variant_name', 'variant_price')
                    ->first();
    
                $modifiers = DB::table('order_detail_modifiers')
                    ->where('order_detail_id', $orderDetail->id)
                    ->select('order_detail_id', 'modifier_name', 'modifier_price')
                    ->get();
    
                $orderDetail->product = $product;
                $orderDetail->variants = $variant;
                $orderDetail->modifiers = $modifiers;
    
                return $orderDetail;
            })->filter()->values(); // Ensure the array is reindexed
    
            $payment = DB::table('payments')
                ->where('id', $order->order_payment)
                ->select('id', 'payment_name')
                ->first();
    
            $cashier = DB::table('users')
                ->where('id', $order->order_cashier)
                ->select('id', 'name')
                ->first();
    
            $discount = DB::table('discounts')
                ->where('id', $order->discount_id)
                ->select('id', 'name', 'type', 'amount')
                ->first();
    
            $referral = DB::table('referral_code')
                ->where('id', $order->referral_code_id)
                ->select('id', 'code', 'discount')
                ->first();
    
            $response = [
                'id' => $order->id,
                'outlet_id' => $order->outlet_id,
                'customer_id' => $order->customer_id,
                'order_subtotal' => $order->order_subtotal,
                'order_total' => $order->order_total,
                'order_payment' => $order->order_payment,
                'order_cashier' => $order->order_cashier,
                'order_type' => $order->order_type,
                'order_table' => $order->order_table,
                'discount_id' => $order->discount_id,
                'referral_code_id' => $order->referral_code_id,
                'status' => $order->status,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
                'outlet' => $outlet,
                'customer' => $customer,
                'order_details' => $orderDetails,
                'payment' => $payment,
                'discount' => $discount,
                'referral' => $referral,
                'cashier' => $cashier,
            ];
    
            return response()->json($response);
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "Failed on get order by id",
                    "status" => "failed",
                    "error" => $th->getMessage()
                ], 500
            );
        }
    }
    


    public function getAllOrder(Request $request)
    {
        try {
            $orders = DB::table('order')
                ->whereNull('deleted_at')
                ->where(function ($query) use ($request) {
                    if ($request->start_date != null && $request->end_date != null) {
                        $query->whereBetween("order.created_at", [
                            Carbon::parse($request->start_date)->startOfDay(), 
                            Carbon::parse($request->end_date)->endOfDay()
                        ]);
                    } else {
                        $query->whereDate("order.created_at", Carbon::today()->toDateString());
                    }
                })
                ->orderByDesc('order.created_at')
                ->get();

            $response = [];

            foreach ($orders as $order) {
                $outlet = DB::table('outlet')
                    ->where('id', $order->outlet_id)
                    ->select('id', 'outlet_name')
                    ->first();

                $customer = DB::table('customer')
                    ->where('id', $order->customer_id)
                    ->select('id', 'name', 'phone', 'identity')
                    ->first();

                $orderDetails = DB::table('order_details')
                    ->where('order_id', $order->id)
                    ->select('id', 'order_id', 'product_id', 'quantity', 'price', 'notes')
                    ->get()
                    ->map(function ($orderDetail) {
                        $product = DB::table('products')
                            ->where('id', $orderDetail->product_id)
                            ->select('id', 'name')
                            ->first();

                        $variant = DB::table('order_detail_variant')
                            ->where('order_detail_id', $orderDetail->id)
                            ->select('order_detail_id', 'variant_name', 'variant_price')
                            ->first();

                        $modifiers = DB::table('order_detail_modifiers')
                            ->where('order_detail_id', $orderDetail->id)
                            ->select('order_detail_id', 'modifier_name', 'modifier_price')
                            ->get();

                        $orderDetail->product = $product;
                        $orderDetail->variants = $variant;
                        $orderDetail->modifiers = $modifiers;

                        return $orderDetail;
                    });

                $payment = DB::table('payments')
                    ->where('id', $order->order_payment)
                    ->select('id', 'payment_name')
                    ->first();

                $cashier = DB::table('users')
                    ->where('id', $order->order_cashier)
                    ->select('id', 'name')
                    ->first();

                $discount = DB::table('discounts')
                    ->where('id', $order->discount_id)
                    ->select('id', 'name', 'type', 'amount')
                    ->first();

                $referral = DB::table('referral_code')
                    ->where('id', $order->referral_code_id)
                    ->select('id', 'code', 'discount')
                    ->first();

                $response[] = [
                    'id' => $order->id,
                    'outlet_id' => $order->outlet_id,
                    'customer_id' => $order->customer_id,
                    'order_subtotal' => $order->order_subtotal,
                    'order_total' => $order->order_total,
                    'order_payment' => $order->order_payment,
                    'order_cashier' => $order->order_cashier,
                    'order_type' => $order->order_type,
                    'order_table' => $order->order_table,
                    'discount_id' => $order->discount_id,
                    'referral_code_id' => $order->referral_code_id,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                    'outlet' => $outlet,
                    'customer' => $customer,
                    'order_details' => $orderDetails,
                    'payment' => $payment,
                    'discount' => $discount,
                    'referral' => $referral,
                    'cashier' => $cashier,
                ];
            }

            $today_total = Order::select(
                DB::raw("SUM(order.order_total) as total"),
            )
                ->where(function ($query) use ($request) {
                    if ($request->start_date != null && $request->end_date != null) {
                        $query->whereBetween("order.created_at", [Carbon::parse($request->start_date)->startOfDay(), Carbon::parse($request->end_date)->endOfDay()]);
                    } else {
                        $query->whereDate("order.created_at", Carbon::today()->toDateString());
                    }
                })
                ->first();
            return response()->json(
                [
                    "message" => "Success get all order",
                    "status" => "success",
                    "data" => $response,
                    "today_total" => (int) $today_total->total ?? 0
                ], 
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "failed to get all order",
                    "status" => "failed",
                    "error" => $th->getMessage()
                ],
                500
            );
        }
    }

    public function getAllOrderByOutlet(Request $request, $id)
    {
        try {
            $orders = DB::table('order')
                ->whereNull('deleted_at')
                ->where('outlet_id', $id)
                ->where(function ($query) use ($request) {
                    if ($request->start_date != null && $request->end_date != null) {
                        $query->whereBetween("order.created_at", [
                            Carbon::parse($request->start_date)->startOfDay(), 
                            Carbon::parse($request->end_date)->endOfDay()
                        ]);
                    } else {
                        $query->whereDate("order.created_at", Carbon::today()->toDateString());
                    }
                })
                ->orderByDesc('order.created_at')
                ->get();

            $response = [];

            foreach ($orders as $order) {
                $outlet = DB::table('outlet')
                    ->where('id', $order->outlet_id)
                    ->select('id', 'outlet_name')
                    ->first();

                $customer = DB::table('customer')
                    ->where('id', $order->customer_id)
                    ->select('id', 'name', 'phone', 'identity')
                    ->first();

                $orderDetails = DB::table('order_details')
                    ->where('order_id', $order->id)
                    ->select('id', 'order_id', 'product_id', 'quantity', 'price', 'notes')
                    ->get()
                    ->map(function ($orderDetail) {
                        $product = DB::table('products')
                            ->where('id', $orderDetail->product_id)
                            ->select('id', 'name')
                            ->first();

                        $variant = DB::table('order_detail_variant')
                            ->where('order_detail_id', $orderDetail->id)
                            ->select('order_detail_id', 'variant_name', 'variant_price')
                            ->first();

                        $modifiers = DB::table('order_detail_modifiers')
                            ->where('order_detail_id', $orderDetail->id)
                            ->select('order_detail_id', 'modifier_name', 'modifier_price')
                            ->get();

                        $orderDetail->product = $product;
                        $orderDetail->variants = $variant;
                        $orderDetail->modifiers = $modifiers;

                        return $orderDetail;
                    });

                $payment = DB::table('payments')
                    ->where('id', $order->order_payment)
                    ->select('id', 'payment_name')
                    ->first();

                $cashier = DB::table('users')
                    ->where('id', $order->order_cashier)
                    ->select('id', 'name')
                    ->first();

                $discount = DB::table('discounts')
                    ->where('id', $order->discount_id)
                    ->select('id', 'name', 'type', 'amount')
                    ->first();

                $referral = DB::table('referral_code')
                    ->where('id', $order->referral_code_id)
                    ->select('id', 'code', 'discount')
                    ->first();

                $response[] = [
                    'id' => $order->id,
                    'outlet_id' => $order->outlet_id,
                    'customer_id' => $order->customer_id,
                    'order_subtotal' => $order->order_subtotal,
                    'order_total' => $order->order_total,
                    'order_payment' => $order->order_payment,
                    'order_cashier' => $order->order_cashier,
                    'order_table' => $order->order_table,
                    'order_type' => $order->order_type,
                    'discount_id' => $order->discount_id,
                    'referral_code_id' => $order->referral_code_id,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                    'outlet' => $outlet,
                    'customer' => $customer,
                    'order_details' => $orderDetails,
                    'payment' => $payment,
                    'discount' => $discount,
                    'referral' => $referral,
                    'cashier' => $cashier,
                ];
            }

            $today_total = Order::select(
                DB::raw("SUM(order.order_total) as total"),
            )
                ->where('outlet_id', $id)
                ->where(function ($query) use ($request) {
                    if ($request->start_date != null && $request->end_date != null) {
                        $query->whereBetween("order.created_at", [Carbon::parse($request->start_date)->startOfDay(), Carbon::parse($request->end_date)->endOfDay()]);
                    } else {
                        $query->whereDate("order.created_at", Carbon::today()->toDateString());
                    }
                })
                ->first();
            return response()->json(
                [
                    "message" => "Success get all order by outlet",
                    "status" => "success",
                    "data" => $response,
                    "today_total" => (int) $today_total->total ?? 0
                ], 
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "failed to get all order",
                    "status" => "failed",
                    "error" => $th->getMessage()
                ],
                500
            );
        }
    }

    public function getAllOrderByOutletBug(Request $request, $id)
    {
        try {
            $data = Order::with('customer', 'order_details', 'order_details.product', 'order_details.variants', 'order_details.modifiers', 'payment', 'discount', 'referral', 'cashier')
                        ->where('outlet_id', $id)
                        ->where(function ($query) use ($request) {
                            if ($request->start_date != null && $request->end_date != null) {
                                $query->whereBetween("order.created_at", [Carbon::parse($request->start_date)->startOfDay(), Carbon::parse($request->end_date)->endOfDay()]);
                            } else {
                                $query->whereDate("order.created_at", Carbon::today()->toDateString());
                            }
                        })
                        ->orderByDesc('order.created_at')
                        ->get();

            $today_total = Order::select(
                DB::raw("SUM(order.order_total) as total"),
            )
                ->where('outlet_id', $id)
                ->where(function ($query) use ($request) {
                    if ($request->start_date != null && $request->end_date != null) {
                        $query->whereBetween("order.created_at", [Carbon::parse($request->start_date)->startOfDay(), Carbon::parse($request->end_date)->endOfDay()]);
                    } else {
                        $query->whereDate("order.created_at", Carbon::today()->toDateString());
                    }
                })
                ->first();
            return response()->json(
                [
                    "message" => "Success get all order by outlet",
                    "status" => "success",
                    "data" => $data,
                    "today_total" => (int) $today_total->total ?? 0
                ], 
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "failed to get all order",
                    "status" => "failed",
                    "error" => $th->getMessage()
                ],
                500
            );
        }
    }

    public function viewOrderDetailActive($outletId, $id = null)
    {
        try {
            $order = DB::table('order')
                ->where('outlet_id', $outletId)
                ->where(function ($query) use ($id) {
                    if ($id != null) {
                        $query->where("order.id", $id);
                    }
                })
                ->latest()
                ->first();

            $outlet = DB::table('outlet')
                ->where('id', $order->outlet_id)
                ->select('id', 'outlet_name')
                ->first();

            $customer = DB::table('customer')
                ->where('id', $order->customer_id)
                ->select('id', 'name', 'phone', 'identity')
                ->first();

            $orderDetails = DB::table('order_details')
                ->where('order_id', $order->id)
                ->select('id', 'order_id', 'product_id', 'quantity', 'price', 'notes')
                ->get();

            $orderDetails = $orderDetails->map(function ($orderDetail) {
                $product = DB::table('products')
                    ->where('id', $orderDetail->product_id)
                    ->select('id', 'name')
                    ->first();

                $variant = DB::table('order_detail_variant')
                    ->where('order_detail_id', $orderDetail->id)
                    ->select('order_detail_id', 'variant_name', 'variant_price')
                    ->first();

                $modifiers = DB::table('order_detail_modifiers')
                    ->where('order_detail_id', $orderDetail->id)
                    ->select('order_detail_id', 'modifier_name', 'modifier_price')
                    ->get();

                $orderDetail->product = $product;
                $orderDetail->variants = $variant;
                $orderDetail->modifiers = $modifiers;

                return $orderDetail;
            });

            $payment = DB::table('payments')
                ->where('id', $order->order_payment)
                ->select('id', 'payment_name')
                ->first();

            $cashier = DB::table('users')
                ->where('id', $order->order_cashier)
                ->select('id', 'name')
                ->first();

            $discount = DB::table('discounts')
                ->where('id', $order->discount_id)
                ->select('id', 'name', 'type', 'amount')
                ->first();

            $referral = DB::table('referral_code')
                ->where('id', $order->referral_code_id)
                ->select('id', 'code', 'discount')
                ->first();

            $response = [
                'id' => $order->id,
                'outlet_id' => $order->outlet_id,
                'customer_id' => $order->customer_id,
                'order_subtotal' => $order->order_subtotal,
                'order_total' => $order->order_total,
                'order_payment' => $order->order_payment,
                'order_cashier' => $order->order_cashier,
                'order_table' => $order->order_table,
                'order_type' => $order->order_type,
                'discount_id' => $order->discount_id,
                'referral_code_id' => $order->referral_code_id,
                'status' => $order->status,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
                'outlet' => $outlet,
                'customer' => $customer,
                'order_details' => $orderDetails,
                'payment' => $payment,
                'discount' => $discount,
                'referral' => $referral,
                'cashier' => $cashier,
            ];

            return response()->json($response);
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "Failed on get order active",
                    "status" => "failed",
                    "error" => $th->getMessage()
                ], 500
            );
        }
    }

    public function viewOrderDetailActiveBug($outletId, $id = null)
    {
        try {
            //DB::enableQueryLog();
            
            // $data = Order::with('outlet', 'customer', 'order_details', 'order_details.product', 'order_details.variants', 'order_details.modifiers', 'payment', 'discount', 'referral', 'cashier')
            // ->where('outlet_id', $outletId)
            // ->where(function ($query) use ($id) {
            //     if ($id != null) {
            //         $query->where("order.id", $id);
            //     }
            // })
            // ->latest()
            // ->first();

            $data = Order::with([
                'outlet:id,outlet_name',
                'customer:id,name,phone,identity',
                'order_details.product:id,name',
                'order_details.variants:order_detail_id,variant_name,variant_price',
                'order_details.modifiers:order_detail_id,modifier_name,modifier_price',
                'payment:id,payment_name',
                'discount:id,name',
                'referral:id,code',
                'cashier:id,name'
            ])
            ->where('outlet_id', $outletId)
            ->where(function ($query) use ($id) {
                if ($id != null) {
                    $query->where("order.id", $id);
                }
            })
            ->latest()
            ->first();

            // // Get all executed queries
            // $queries = DB::getQueryLog();

            // // Output the executed queries including those for eager-loaded relations
            // dd($queries);

            return response()->json($data);
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "Failed on get order active",
                    "status" => "failed",
                    "error" => $th->getMessage()
                ], 500
            );
        }
    }

    public function getTransactionReport(Request $request)
    {
        try {
            $startDate = $request->input('start_date'); // Start date filter (optional)
            $endDate = $request->input('end_date'); // End date filter (optional)
            $outletId = $request->input('outlet_id'); // Outlet ID filter (optional)

            // Query to fetch the orders data
            $orders = DB::table('outlet')
                ->leftJoin('order', 'outlet.id', '=', 'order.outlet_id')
                ->leftJoin('payments', 'order.order_payment', '=', 'payments.id')
                ->select(
                    DB::raw("DATE(order.created_at) as order_date"),
                    'outlet.id as outlet_id',
                    'outlet.outlet_name',
                    'payments.payment_name',
                    DB::raw("SUM(order.order_total) as total")
                )
                ->when($outletId, function($query, $outletId) {
                    return $query->where('outlet.id', $outletId); // Filter by outlet ID if provided
                })
                ->when($startDate && $endDate, function($query) use ($startDate, $endDate) {
                    // Use whereBetween for date range filtering
                    return $query->whereBetween("order.created_at", [
                        Carbon::parse($startDate)->startOfDay(), 
                        Carbon::parse($endDate)->endOfDay()
                    ]);
                })
                ->groupBy('order_date', 'outlet.id', 'outlet.outlet_name', 'payments.payment_name')
                ->orderBy('order_date', 'desc')
                ->get();

            // Fetch distinct dates
            $dates = $orders->pluck('order_date')->unique()->sortDesc();

            // Fetch outlet names for response
            $outlets = DB::table('outlet')->pluck('outlet_name', 'id');
            // Fetch all payment methods for response
            $allPaymentMethods = DB::table('payments')->pluck('payment_name');

            $response = [];

            foreach ($dates as $date) {
                $formattedDate = Carbon::parse($date)->format('d-m-Y');
                $entry = [
                    'order_date' => $formattedDate,
                    'total_all' => 0
                ];

                // Check if outletId is provided to filter only relevant outlets
                foreach ($outlets as $outlet_id => $outlet_name) {
                    // Filter orders for the given date and outlet
                    $outletOrders = $orders->where('order_date', $date)->where('outlet_id', $outlet_id);

                    // Initialize the outlet data array
                    $outletData = [
                        'Total' => 0 // Initialize the total for the outlet
                    ];

                    // Iterate over all payment methods and calculate totals
                    foreach ($allPaymentMethods as $paymentName) {
                        $paymentTotal = $outletOrders->where('payment_name', $paymentName)->sum('total');
                        $outletData[$paymentName] = $paymentTotal; // Store the payment total
                        $outletData['Total'] += $paymentTotal; // Add to the outlet's total
                    }

                    // Only add outlet data to the entry if the total is greater than 0
                    if ($outletData['Total'] > 0 || !$outletId) {
                        $entry[$outlet_name] = $outletData;
                        $entry['total_all'] += $outletData['Total']; // Update the total for the day
                    }
                }

                // Only add the entry to the response if there are non-zero totals or if no outletId is provided
                if ($entry['total_all'] > 0 || !$outletId) {
                    $response[] = $entry;
                }
            }

            return response()->json([
                "message" => "Success get transaction report",
                "status" => "success",
                "data" => $response
            ], 200);
        } catch (Exception $th) {
            return response()->json([
                "message" => "failed to get transaction report",
                "status" => "failed",
                "error" => $th->getMessage()
            ], 500);
        }
    }

    public function getStatisticsEveryOutlet(Request $request)
    {
        $outlets = DB::table('outlet')->get();
        $revenues = [];
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $date = $request->query('date') ? Carbon::parse($request->query('date')) : null;

        if ($date) {
            $orders = DB::table('order')
                ->whereNull('deleted_at')
                ->select('outlet_id', DB::raw('COALESCE(SUM(order_total), 0) as total_revenue'), DB::raw('COUNT(*) as transactions'))
                ->whereDate('created_at', $date)
                ->groupBy('outlet_id')
                ->get()->keyBy('outlet_id');

            $quantities = DB::table('order_details')
                ->join('order', 'order_details.order_id', '=', 'order.id')
                ->select('order.outlet_id', DB::raw('COALESCE(SUM(order_details.quantity), 0) as total_quantity'))
                ->whereDate('order.created_at', $date)
                ->groupBy('order.outlet_id')
                ->get()->keyBy('outlet_id');

            foreach ($outlets as $outlet) {
                $revenueData = $orders->get($outlet->id);
                $quantityData = $quantities->get($outlet->id);

                $revenues[$outlet->id] = [
                    'date' => $date->toDateString(),
                    'outlet_id' => $outlet->id,
                    'outlet_name' => $outlet->outlet_name,
                    'revenue' => $revenueData->total_revenue ?? 0,
                    'quantity' => $quantityData->total_quantity ?? 0,
                    'transactions' => $revenueData->transactions ?? 0,
                ];
            }
        } else {
            $todayOrders = DB::table('order')
                ->select('outlet_id', DB::raw('COALESCE(SUM(order_total), 0) as total_revenue'), DB::raw('COUNT(*) as transactions'))
                ->whereDate('created_at', $today)
                ->groupBy('outlet_id')
                ->get()->keyBy('outlet_id');

            $todayQuantities = DB::table('order_details')
                ->join('order', 'order_details.order_id', '=', 'order.id')
                ->select('order.outlet_id', DB::raw('COALESCE(SUM(order_details.quantity), 0) as total_quantity'))
                ->whereDate('order.created_at', $today)
                ->groupBy('order.outlet_id')
                ->get()->keyBy('outlet_id');

            $yesterdayOrders = DB::table('order')
                ->select('outlet_id', DB::raw('COALESCE(SUM(order_total), 0) as total_revenue'), DB::raw('COUNT(*) as transactions'))
                ->whereDate('created_at', $yesterday)
                ->groupBy('outlet_id')
                ->get()->keyBy('outlet_id');

            $yesterdayQuantities = DB::table('order_details')
                ->join('order', 'order_details.order_id', '=', 'order.id')
                ->select('order.outlet_id', DB::raw('COALESCE(SUM(order_details.quantity), 0) as total_quantity'))
                ->whereDate('order.created_at', $yesterday)
                ->groupBy('order.outlet_id')
                ->get()->keyBy('outlet_id');

            foreach ($outlets as $outlet) {
                $todayRevenueData = $todayOrders->get($outlet->id);
                $todayQuantityData = $todayQuantities->get($outlet->id);
                $yesterdayRevenueData = $yesterdayOrders->get($outlet->id);
                $yesterdayQuantityData = $yesterdayQuantities->get($outlet->id);

                $revenues[$outlet->id] = [
                    'outlet_id' => $outlet->id,
                    'outlet_name' => $outlet->outlet_name,
                    'today_revenue' => $todayRevenueData->total_revenue ?? 0,
                    'today_quantity' => $todayQuantityData->total_quantity ?? 0,
                    'today_transactions' => $todayRevenueData->transactions ?? 0,
                    'yesterday_revenue' => $yesterdayRevenueData->total_revenue ?? 0,
                    'yesterday_quantity' => $yesterdayQuantityData->total_quantity ?? 0,
                    'yesterday_transactions' => $yesterdayRevenueData->transactions ?? 0,
                ];
            }
        }

        return response()->json($revenues);
    }

    public function getTotalQuantitySold(Request $request, $outletId)
    {
        try {
            $data = DB::table('order')
            ->join('order_details', 'order.id', '=', 'order_details.order_id')
            ->join('products', 'order_details.product_id', '=', 'products.id')
            ->join('outlet', 'order.outlet_id', '=', 'outlet.id')
            ->select(
                'products.name as product',
                DB::raw('SUM(order_details.quantity) as total_sold')
            )
            ->where('order.outlet_id', $outletId)
            ->where(function ($query) use ($request) {
                if ($request->start_date != null && $request->end_date != null) {
                    $query->whereBetween("order.created_at", [
                        Carbon::parse($request->start_date)->startOfDay(), 
                        Carbon::parse($request->end_date)->endOfDay()
                    ]);
                } else {
                    $query->whereDate("order.created_at", Carbon::today()->toDateString());
                }
            })
            ->groupBy('products.id', 'products.name')
            ->get();

            // $data = DB::table('order')
            // ->join('order_details', 'order.id', '=', 'order_details.order_id')
            // ->join('order_detail_variant', 'order_details.id', '=', 'order_detail_variant.order_detail_id')
            // ->join('products', 'order_details.product_id', '=', 'products.id')
            // ->join('product_variants', 'order_detail_variant.variant_name', '=', 'product_variants.name')
            // ->join('outlet', 'order.outlet_id', '=', 'outlet.id')
            // ->select(
            //     'products.name as product_name',
            //     'product_variants.name as variant_name',
            //     DB::raw('SUM(order_details.quantity) as total_quantity_sold')
            // )
            // ->where('order.outlet_id', $outletId)
            // ->where(function ($query) use ($request) {
            //     if ($request->start_date != null && $request->end_date != null) {
            //         $query->whereBetween("order.created_at", [
            //             Carbon::parse($request->start_date)->startOfDay(), 
            //             Carbon::parse($request->end_date)->endOfDay()
            //         ]);
            //     } else {
            //         $query->whereDate("order.created_at", Carbon::today()->toDateString());
            //     }
            // })
            // ->groupBy('products.id', 'products.name', 'product_variants.name')
            // ->get();

            return response()->json([
                "message" => "Success get all product sold",
                "status" => "success",
                "data" => $data
            ],200);
        } catch (Exception $th) {
            return response()->json([
                "message" => "failed to get product sold",
                "status" => "failed",
                "error" => $th->getMessage()
            ],500);
        }
    }

    public function getBusyHours(Request $request, $outletId)
    {
        try{
            $data = DB::table('order')
            ->select(DB::raw('HOUR(created_at) as hour, COUNT(*) as total_transactions'))
            ->when($outletId, function ($query) use ($outletId) {
                return $query->where('outlet_id', $outletId);
            })
            ->where(function ($query) use ($request) {
                if ($request->start_date != null && $request->end_date != null) {
                    $query->whereBetween("order.created_at", [
                        Carbon::parse($request->start_date)->startOfDay(), 
                        Carbon::parse($request->end_date)->endOfDay()
                    ]);
                } else {
                    $query->whereDate("order.created_at", Carbon::today()->toDateString());
                }
            })
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

            return response()->json([
                "message" => "Success get busy hours",
                "status" => "success",
                "data" => $data
            ], 200);
        } catch (Exception $th) {
            return response()->json([
                "message" => "failed to get busy hours",
                "status" => "failed",
                "error" => $th->getMessage()
            ], 500);
        }  
    }

    public function createOrder(Request $request)
    {
        DB::beginTransaction();
        try {
            $validated = FacadesValidator::make($request->all(), [
                "customer_name" => 'required',
                "phone_number" => 'nullable',
                'outlet_id' => 'required|exists:outlet,id',
                'order_details' => 'required|array',
                'order_details.*.notes' => 'nullable',
                'order_details.*.product_id' => 'required|exists:products,id',
                'order_details.*.qty' => 'required',
                'order_details.*.variant_id' => 'required',
                'order_details.*.modifier_option_ids' => 'nullable|exists:modifier_options,id',
                'order_details.*.modifier_option_ids.*' => '',
                'order_payment' => 'required',
                'order_totals' => 'required',
                'order_type' => 'required|in:dinein,takeaway,delivery',
                'order_table' => 'nullable',
                'referral_code' => 'nullable|exists:referral_code,code',
                'discount_id' => 'nullable|exists:discounts,id',
            ]);

            if ($validated->fails()) {
                return response()->json(
                    [
                        "message" => $validated->errors(),
                        "status" => "failed",
                    ],
                    400
                );
            }

            $items = $request->order_details;

            $item = array();

            foreach ($items as $key => $value) {
                $productId = $value['product_id'];
                $product = Product::where('id', $productId)->first();
                $productVariant = ProductVariant::where('product_id', $productId)->first();
                array_push($item, $product->name . ' X ' . $value['qty'] . ' Rp.' . (string) $productVariant->price * $value['qty']);
            }

            $customer = Customer::updateOrCreate(
                [
                    "name" => $request->customer_name,
                    "phone" => $request->phone_number
                ]
            );

            $discount = null;
            $referalCode = null;
            $dataCreated = [
                "id" => Str::uuid()->toString(),
                "order_cashier" => $request->user() ? $request->user()->id : 2,
                "order_payment" => $request->order_payment,
                "order_type" => $request->order_type,
                'order_table' => $request->order_table,
                'customer_id' => $customer->id,
                'outlet_id' => $request->outlet_id,
                'status' => 'paid'
            ];
            
            if ($request->has('referral_code')) {
                $referalCode = ReferralCode::where('code', $request->referral_code)->first();
                $dataCreated['referral_code_id'] = $referalCode->id;
            }
            
            if ($request->has('discount_id')) {
                $discount = Discount::where('id', $request->discount_id)->first();
                $dataCreated['discount_id'] = $request->discount_id;
            }
            
            $order = Order::create(
                $dataCreated
            );

            $total = 0;

            foreach ($items as $key => $valueOrder) {
                $productId = $valueOrder['product_id'];
                $product = Product::where('id', $productId)->first();
                $priceProduct = ProductVariant::where('id', $valueOrder['variant_id'])->where('product_id', $productId)->first();

                if(!isset($priceProduct)){
                    return response()->json(
                        [
                            'status' => 'failed',
                            'message' => 'variant not found '
                        ], 400
                    );
                }

                $priceProductDetail = $priceProduct->price * $valueOrder['qty'];
                $orderDetail = OrderDetail::create(
                    [
                        'quantity' => $valueOrder['qty'],
                        'product_id' => $productId,
                        'notes' => $valueOrder['notes'] ?? '',
                        'order_id' => $order->id,
                        'price' => $priceProductDetail
                    ]
                );

                $itemVariant = [
                    'order_detail_id' => $orderDetail->id,
                    'variant_name' => $priceProduct->name,
                    'variant_price' => $priceProduct->price
                ];

                OrderDetailVariant::create($itemVariant);
                $totalModifier = 0;
                if (isset($valueOrder['modifier_option_ids'])) {
                    foreach ($valueOrder['modifier_option_ids'] as $key => $value) {
                        $modifierOption = ModifierOption::where('id', $value)->with('modifier', 'modifier.productsModifier')->first();
                        $productExists = $modifierOption->modifier->productsModifier->contains('product_id', $valueOrder['product_id']);
                        if (!$productExists) {
                            return response()->json(
                                [
                                    'status' => 'failed',
                                    'message' => 'product doesnt have modifier option with id '.$value
                                ], 400
                            );
                        }
                        $itemModifier = [
                            'order_detail_id' => $orderDetail->id,
                            'modifier_name' => $modifierOption->name,
                            'modifier_price' => $modifierOption->price
                        ];
                        OrderDetailModifier::create($itemModifier);
                        $totalModifier += $modifierOption->price * $valueOrder['qty'];
                        
                    }
                }
                $orderDetail->price = $priceProductDetail + $totalModifier;
                $orderDetail->save();
                $total += $priceProductDetail + $totalModifier;
            }
            $order->order_subtotal = $total;

            if(isset($discount)){
                if($discount->type == 'percent'){
                    $discountPrice = $total * $discount->amount / 100;
                    $total -= $discountPrice;
                }else{
                    $total -= $discount->amount;
                }
            }
            if(isset($referalCode)){
                if($referalCode->quotas > 0 && $referalCode->is_active){
                    $referalCodePrice = $total * $referalCode->discount / 100;
                    $total -= $referalCodePrice;
                    
                }else{
                    DB::rollBack();
                    return response()->json(
                        [
                            "message" => 'Referral code quotas are not available or are inactive.',
                            "status" => "failed",
                        ],
                        410
                    );
                }
            }

            $order->order_total = $total;
            $order->save();

            if ($total != $request->order_totals) {
                DB::rollBack();
                return response()->json(
                    [
                        'status' => 'failed',
                        'message' => 'order totals not same with actual totals',
                        'actual_total' => $total,
                        'request_total' => $request->order_totals
                    ],
                    400
                );
            }
            DB::commit();

            if (!is_null($request->referral_code)) {
                $referral = ReferralCode::where("code", $request->referral_code)->first();

                ReferralCodeLogs::create(
                    [
                        "referral_code_id" => $referral->id,
                        "order_id" => $order->id
                    ]
                );
            }

            $this->sentBilltoWA($order, $customer, $total, $item, $request);

            return response()->json(
                [
                    "message" => "success on create order",
                    "status" => "success",
                    "data" => $order
                ],
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "failed on create order",
                    "status" => "failed",
                    "error" => $th->getMessage(),
                    'line' => $th->getLine()
                ],
                500
            );
        }
    }

    public function sentBilltoWA($order, $customer, $total, $item, $request) {
        $curl = curl_init(); 
        $message =
            'Halo ' . $request->customer_name . " \n" .
            'Pesanan Anda Pada ' . Carbon::now("Asia/Jakarta")->toString() . " \n" . "\n" .
            implode(" \n", $item) . "\n" . "\n" .
            'Total : Rp.' . $total . "\n\n" .
            'Terima Kasih Atas Pesanan ' . $request->order_name;

        curl_setopt_array($curl, array(
            CURLOPT_URL => 'https://api.fonnte.com/send',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => array(
                'target' => $customer->phone_number,
                'message' => $message,
                'countryCode' => '62', //optional
            ),
            CURLOPT_HTTPHEADER => array(
                'Authorization: HCfNGpYH3T#--Rsq@cjr' //change TOKEN to your actual token
            ),
        ));

        $response = curl_exec($curl);
        curl_close($curl);
        TransactionLogs::create(
            [
                "customer_id" => $customer->id,
                "order_id" => $order->id,
                "response" => $response
            ]
        );
    }

     public function updateOrderById(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);

            // Validasi input
            $validatedData = $request->validate([
                'created_at' => 'required|date',
                'customer_id' => 'nullable|exists:customer,id',
                'customer_name' => 'nullable|string',
                'phone_number' => 'nullable|string',
            ]);

            // Jika customer_id tersedia, update customer tersebut
            if ($order->customer_id) {
                $customer = Customer::findOrFail($order->customer_id);
                
                // Update nama customer jika ada perubahan
                if ($request->has('customer_name') && $request->customer_name != $customer->name) {
                    $customer->update([
                        'name' => $request->customer_name,
                        'phone' => $request->phone_number ?? $customer->phone
                    ]);
                }
                
                $customerId = $customer->id;
            } 
            // Jika tidak ada customer_id, baru cari atau buat customer baru
            else if ($request->customer_name) {
                $phone = $request->phone_number;
                $customer = Customer::where('name', $request->customer_name)->first();
                if (!$customer) {
                    $customer = Customer::create([
                        'name' => $request->customer_name,
                        'phone' => $phone,
                    ]);
                }
                $customerId = $customer->id;
            } else {
                return response()->json([
                    'message' => 'Customer id or name is required',
                    'errors' => [
                        'customer_id' => ['The customer id field is required if customer name is not filled.'],
                        'customer_name' => ['The customer name field is required if customer id is not filled.'],
                    ]
                ], 422);
            }

            $order->update([
                'customer_id' => $customerId,
                'created_at' => $validatedData['created_at']
            ]);

            return response()->json([
                'message' => 'Order updated successfully',
                'data' => [
                    'order' => $order,
                    'customer' => Customer::find($customerId)
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $th) {
            return response()->json([
                'message' => $th->getMessage()
            ], 500);
        }
    }

    public function updateCustomer(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);
        $customer->update([
            'name' => $request->name,
            'phone' => $request->phone,
        ]);
        return response()->json(['message' => 'Customer updated', 'data' => $customer]);
    }

    public function deleteOrderById($id)
    {
        try {
           Order::where('id', $id)->delete();

            return response()->json(
                [
                    "message" => "success delete order by id",
                    "status" => "success",
                ],
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "failed delete order by id",
                    "status" => "failed",
                    "error" => $th->getMessage()
                ],
                500
            );
        }
    }

    public function getCustomers(Request $request)
    {
        try {
            $customers = Customer::all();

            return response()->json(
                [
                    "message" => "success get all customers",
                    "status" => "success",
                    "data" => $customers
                ],
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "failed get all customers",
                    "status" => "failed",
                    "error" => $th->getMessage()
                ],
                500
            );
        }
    }
}