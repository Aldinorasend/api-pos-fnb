<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Models\Order;
use App\Models\Outlet;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DiscountController extends Controller
{
    public function index()
    {
        try {
            $discount = Discount::with('outlets')->orderByDesc('created_at')->get();
            
            return response()->json([
                "message" => "Success get all discounts",
                "status" => "Success",
                "data" => $discount
            ],200);
        } catch (Exception $th) {
            return response()->json([
                "message" => "Failed to fetch discounts",
                "status" => "Failed",
                "error" => $th->getMessage()
            ],500);
        }
    }

    public function show($id)
    {
        try {
            $discount = Discount::find($id);

            if ($discount) {
                return response()->json([
                    "message" => "Success get discount",
                    "status" => "Success",
                    "data" => $discount
                ]);
            } else {
                return response()->json([
                    "message" => "Discount not found",
                    "status" => false,
                ],404);
            }
        } catch (Exception $th) {
            return response()->json([
                "message" => "Failed to fetch discount",
                "status" => "Failed",
                "error" => $th->getMessage()
            ],500);
        }
    }

    public function getDiscountByOutlet(){
        try {
            $currentUser = auth()->user();
            $outletIds = $currentUser->outlets->pluck('id');

            $discounts = Discount::whereHas('outlets', function ($query) use ($outletIds) {
                $query->whereIn('outlet_id', $outletIds);
            })->get();

            return response()->json([
                "message" => "Success get discounts by outlet",
                "status" => true,
                "data" => $discounts
            ],200);
        } catch (Exception $th) {
            return response()->json([
                "message" => "Failed to get discounts by outlet",
                "status" => false,
                "error" => $th->getMessage()
            ],500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|string|in:percent,fixed',
                'amount' => 'required|numeric|min:0',
                'outlet_ids' => 'nullable|array'
            ]);

            if ($request->has('outlet_ids')) {
                $outletIds = $request->input('outlet_ids');
                $invalidOutletId = array_diff($outletIds, Outlet::whereIn('id', $outletIds)->pluck('id')->toArray());

                if (!empty($invalidOutletId)) {
                    return response()->json([
                        "message" => "Outlet(s) not found",
                        "status" => false,
                        "data" => $invalidOutletId
                    ], 400);
                }
            }

            $discount = Discount::create([
                "name" => $validatedData['name'],
                "type" => $validatedData['type'],
                "amount" => $validatedData['amount']
            ]);

            if ($request->has('outlet_ids')) {
                $discount->outlets()->sync($request->input('outlet_ids'));
            }

            return response()->json([
                "message" => "success on creating discount",
                "status" => true
            ],200);
        } catch (ValidationException $e) {
            return response()->json([
                "message" => "Validation failed",
                "status" => false,
                "errors" => $e->errors()
            ],422);
        } catch (Exception $th) {
            return response()->json([
                "message" => "failed to create discount",
                "status" => false,
                "error" => $th->getMessage()
            ],500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $discount = Discount::find($id);

            if ($discount) {
                $validatedData = $request->validate([
                    'name' => 'required|string|max:255',
                    'type' => 'required|string|in:percent,fixed',
                    'amount' => 'required|numeric|min:0',
                    'outlet_ids' => 'nullable|array'
                ]);

                if ($request->has('outlet_ids')) {
                    $outletIds = $request->input('outlet_ids');
                    $invalidOutletId = array_diff($outletIds, Outlet::whereIn('id', $outletIds)->pluck('id')->toArray());
    
                    if (!empty($invalidOutletId)) {
                        return response()->json([
                            "message" => "Outlet(s) not found",
                            "status" => false,
                            "data" => $invalidOutletId
                        ], 400);
                    }
                }

                $discount->update([
                    "name" => $validatedData['name'],
                    "type" => $validatedData['type'],
                    "amount" => $validatedData['amount']
                ]);

                if ($request->has('outlet_ids')) {
                    $discount->outlets()->sync($request->input('outlet_ids'));
                }

                return response()->json([
                    "message" => "success on updating discount",
                    "status" => true
                ],200);
            } else {
                return response()->json([
                    "message" => "discount not found",
                    "status" => false
                ],404);
            }
        } catch (ValidationException $e) {
            return response()->json([
                "message" => "Validation failed",
                "status" => false,
                "errors" => $e->errors()
            ],422);
        } catch (Exception $th) {
            return response()->json([
                "message" => "failed to update discount",
                "status" => false,
                "error" => $th->getMessage()
            ],500);
        }
    }

    public function destroy($id)
    {
        try {
            $discount =Discount::find($id);

            if ($discount) {
                $usedInOrder = Order::where('discount_id', $id)->exists();

                if ($usedInOrder) {
                    return response()->json([
                        "message" => "Cannot delete discount, it is used in an order",
                        "status" => false
                    ],400);
                }

                $discount->delete();
                return response()->json([
                    "message" => "success on deleting discount",
                    "status" => true
                ],200);
            } else {
                return response()->json([
                    "message" => "discount not found",
                    "status" => false
                ],404);
            }
        } catch (Exception $th) {
            return response()->json([
                "message" => "failed to delete discount",
                "status" => false,
                "error" => $th->getMessage()
            ],500);
        }
    }
}
