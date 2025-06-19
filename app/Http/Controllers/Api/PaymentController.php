<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payments;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    public function index()
    {
        try {
            $data = Payments::all();

            return response()->json(
                [
                    "message" => "success get all payment methode",
                    "status" => "success",
                    "data" => $data
                ],
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "failed get payment method",
                    "status" => "failed",
                    "data" => $th->getMessage()
                ],
                500
            );
        }
    }

    public function store(Request $request)
    {
        $validate = Validator::make($request->all(), [
            "payment_name" => "required",
        ]);

        if ($validate->fails()) {
            return response()->json(
                [
                    "message" => "failed to create payment",
                    "status" => "Failed",
                    "errors" => $validate->errors()
                ]
            );
        }

        Payments::create(
            [
                "payment_name" => $request->payment_name,
                "payment_description" => $request->payment_description ?? ""
            ]
        );

        return response()->json(
            [
                "message" => "success on create payment methode",
                "status" => "Success"
            ],
            200
        );
    }

    public function update(Request $req,$id)
    {
        try {
            $payment = Payments::find($id);
            $payment->payment_name = $req->payment_name;
            $payment->payment_description = $req->payment_description;
            $payment->save();

            return response()->json(
                [
                    "message" => "success on update paymnet",
                    "status" => true
                ], 200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "Failed to update payment",
                    "status" => false,
                    "error" => $th->getMessage()
                ]
            );
        }
    }

    public function destroy($id)
    {
        try {
            Payments::destroy($id);

            return response()->json(
                [
                    "message" => "Success On Delete Payment By Id",
                    "status" => true
                ],
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "Failed To Delete Payment",
                    "status" => false,
                    "error" => $th->getMessage()
                ],
                500
            );
        }
    }
}
