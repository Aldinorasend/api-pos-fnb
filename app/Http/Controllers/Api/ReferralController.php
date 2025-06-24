<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReferralCode;
use App\Models\ReferralCodeLogs;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReferralController extends Controller
{
    public function index()
    {
        try {
            $data = ReferralCode::select(
                "referral_code.id as id",
                "referral_code.code as code",
                "referral_code.description as description",
                "referral_code.quotas as quotas",
                "referral_code.expired_date as expired_date",
                "referral_code.discount as discount",
                "referral_code.created_at as created_at",  
                DB::raw("COUNT(rcl.referral_code_id) as usaged")
            )
                ->leftJoin("referral_code_logs as rcl", "rcl.referral_code_id", "=", "referral_code.id")
                ->groupBy("referral_code.id")
                ->get();

            return response()->json(
                [
                    "message" => "Success on get ALL referral code",
                    "status" => true,
                    "data" => $data
                ]
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "Failed to get all referral code",
                    "status" => false,
                    "error" => $th->getMessage()
                ]
            );
        }
    }

    public function verifiedReferralCode(Request $req)
    {
        try {
            $code = ReferralCode::select(
                "id",
                "discount",
                "expired_date",
                "quotas"
            )
                ->where("code", $req->code)
                ->where("is_active", true)
                ->firstOrFail();

            $usaged = ReferralCodeLogs::select(
                "id"
            )
                ->where("referral_code_id", $code->id)
                ->count();

            if ($usaged >= $code->quotas) {
                return response()->json(
                    [
                        "message" => "Maaf quota referral code sudah habis",
                        "status" => false
                    ]
                );
            }

            $exp_date = Carbon::parse($code->expired_date);

            if (Carbon::now()->gt($exp_date)) {
                return response()->json(
                    [
                        "message" => "Maaf masa penggunaan referral code sudah habis",
                        "status" => false
                    ]
                );
            }

            return response()->json(
                [
                    "message" => "Referral code ditemukan dan akan di pakai",
                    "status" => true,
                    "data" => $code
                ]
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "Referral Code Tidak Ditemukan",
                    "status" => false,
                    "error" => $th->getMessage()
                ]
            );
        }
    }

    public function store(Request $req)
    {
        try {
            ReferralCode::create(
                [
                    "code" => $req->code,
                    "description" => $req->description,
                    "expired_date" => $req->expired_date,
                    "discount" => $req->discount,
                    "quotas" => $req->quotas,
                    "is_active" => true
                ]
            );

            return response()->json(
                [
                    "message" => "success on create referral code",
                    "status" => true
                ],
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "failed to create referral code",
                    "status" => false,
                    "error" => $th->getMessage()
                ],
                500
            );
        }
    }

    public function update(Request $req, $id)
    {
        try {
            $code = ReferralCode::find($id);

            $code->code = $req->code;
            $code->description = $req->description;
            $code->expired_date = Carbon::parse($req->expired_date)->toDateString();
            $code->discount = $req->discount;
            $code->quotas = $req->quotas;

            $code->save();

            return response()->json(
                [
                    "message" => "success on update referral code",
                    "status" => true
                ], 200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "failed to update referral code",
                    "status" => false,
                    "error" => $th->getMessage()
                ]
            );
        }
    }

    public function destroy($id)
    {
        try {
            ReferralCode::destroy($id);

            return response()->json(
                [
                    "message" => "success on delete referral code",
                    "status" => true
                ]
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "failed on delete referral code",
                    "status" => false,
                    "error" => $th->getMessage()
                ],
                500
            );
        }
    }
}
