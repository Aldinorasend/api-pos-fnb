<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetMail;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index()
    {
        try {
            $data = User::with('outlets')
                ->select(
                    "users.id as id",
                    "users.name",
                    "users.email",
                    "p.role as role",
                    "p.id as role_id",
                    "users.is_active",
                    "users.created_at"
                )
                ->join("roles as p", "users.role_id", "=", "p.id")
                ->orderByDesc('users.created_at')
                ->get();

            return response()->json(
                [
                    "message" => "Success on get all user",
                    "status" => true,
                    "data" => $data
                ],
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "failed to get all user",
                    "status" => false,
                    "error" => $th->getMessage()
                ],
                500
            );
        }
    }

    public function getAllUsersByOutlet()
    {
        try {
            $currentUser = auth()->user();
            $outletIds = $currentUser->outlets->pluck('id');
            $data = User::with('outlets')
                ->select(
                    "users.id as id",
                    "users.name",
                    "users.email",
                    "p.role as role",
                    "p.id as role_id",
                    "users.is_active",
                    "users.created_at"
                )
                ->join("roles as p", "users.role_id", "=", "p.id")
                ->whereHas('outlets', function ($query) use ($outletIds) {
                    $query->whereIn('outlet.id', $outletIds);
                })
                ->where('role_id', '!=', 1)
                ->orderByDesc('users.created_at')
                ->get();

            return response()->json(
                [
                    "message" => "Success on get all users by outlet",
                    "status" => true,
                    "data" => $data
                ],
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "Failed to get all users by outlet",
                    "status" => false,
                    "error" => $th->getMessage()
                ],
                500
            );
        }
    }

    public function getAllRoles()
    {
        try {
            if (auth()->user()->role_id != 1) {
                $data = Role::select(
                    "role as label",
                    "id as value"
                )
                ->where('id', '!=', 1)
                ->get();
            } else {
                $data = Role::select(
                    "role as label",
                    "id as value"
                )
                ->get();
            }

            return response()->json(
                [
                    "message" => "success get all user type",
                    "status" => true,
                    "data" => $data
                ],
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "failed to get all user type",
                    "status" => false,
                    "error" => $th->getMessage()
                ],
                500
            );
        }
    }

    public function store(Request $req)
    {
        try {
            $validate = Validator::make(
                $req->all(),
                [
                    "email" => "required|unique:users,email|email",
                    "password" => "required",
                    "name" => "required",
                    "role_id" => "required",
                    "outlets_id" => "required|array"
                ],
                [
                    'role_id.required' => 'The role field is required.',
                    'outlets_id.required' => 'The outlet is required.',

                ]
            );

            if ($validate->fails()) {
                return response()->json([
                    "message" => "Validation errors",
                    "status" => false,
                    "errors" => $validate->errors()
                ], 422);
            }

            // Validasi ID outlet
            $outletIds = $req->input('outlets_id');
            $invalidOutletIds = [];
            foreach ($outletIds as $outletId) {
                if (!Outlet::where('id', $outletId)->exists()) {
                    $invalidOutletIds[] = $outletId;
                }
            }

            if (!empty($invalidOutletIds)) {
                return response()->json([
                    "message" => "Outlet(s) not found",
                    "status" => false,
                    "invalid_outlet_ids" => $invalidOutletIds
                ], 400);
            }

            $user = User::create([
                "name" => $req->input('name'),
                "email" => $req->input('email'),
                "password" => Hash::make($req->input('password')),
                "role_id" => $req->input('role_id'),
                "email_verified_at" => now(),
                "remember_token" => Str::random(10)
            ]);

            if ($req->has('outlets_id')) {
                $user->outlets()->sync($req->input('outlets_id'));
            }

            return response()->json(
                [
                    "message" => "Success on create new user",
                    "status" => true,
                ],
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "Failed to create new user",
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
            $validate = Validator::make(
                $req->all(),
                [
                    "email" => "required|email|unique:users,email," . $id,
                    "name" => "required",
                    "role_id" => "required",
                    "outlets_id" => "required|array"
                ],
                [
                    'role_id.required' => 'The role field is required.',
                    'outlets_id.required' => 'The outlet is required.',

                ]
            );

            if ($validate->fails()) {
                return response()->json([
                    "message" => "Validation errors",
                    "status" => false,
                    "errors" => $validate->errors()
                ], 422);
            }

            $user = User::findOrFail($id);

            $user->name = $req->input('name');
            $user->email = $req->input('email');
            $user->role_id = $req->input('role_id');
            $user->save();

            // Menambahkan outlet_ids jika ada
            if ($req->has('outlets_id')) {
                $user->outlets()->sync($req->input('outlets_id'));
            }

            return response()->json([
                "message" => "Success on update user",
                "status" => true
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                "message" => "Failed on update user",
                "status" => false,
                "error" => $e->getMessage()
            ], 500);
        }
    }

    public function updateUserStatus($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->is_active = !$user->is_active;
            $user->save();

            return response()->json([
                'message' => 'Success on update user status',
                'status' => true,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed on update user status',
                'status' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function sendPasswordResetLink(Request $req)
    {
        $validate = Validator::make($req->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validate->fails()) {
            return response()->json([
                "message" => "Validation errors",
                "status" => false,
                "errors" => $validate->errors()
            ], 422);
        }

        $user = User::where('email', $req->input('email'))->first();
        $token = Str::random(60);
        $user->reset_token = $token;
        $user->token_expiry = Carbon::now()->addMinutes(1);
        $user->save();

        // URL untuk reset password
        $resetUrl = url("/reset-password/{$token}");

        // Kirim email ke pengguna dengan URL reset password
        Mail::to($user->email)->send(new PasswordResetMail($resetUrl));

        return response()->json([
            "message" => "Password reset link sent",
            "status" => true,
        ], 200);
    }

    public function updatePasswordWithToken(Request $req, $token)
    {
        try {
            $validate = Validator::make($req->all(), [
                'password' => 'required|min:8|confirmed'
            ]);

            if ($validate->fails()) {
                return response()->json([
                    "message" => "Validation errors",
                    "status" => false,
                    "errors" => $validate->errors()
                ], 422);
            }

            $user = User::where('reset_token', $token)
                        ->where('token_expiry', '>', Carbon::now())
                        ->first();

            if (!$user) {
                return response()->json([
                    "message" => "Invalid or expired token",
                    "status" => false
                ], 400);
            }

            $user->password = Hash::make($req->input('password'));
            $user->reset_token = null;
            $user->token_expiry = null;
            $user->save();

            return response()->json([
                "message" => "Password updated successfully",
                "status" => true
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                "message" => "Failed to update password",
                "status" => false,
                "error" => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();

            return response()->json([
                "status" => true,
                "message" => "Success on delete user"
            ], 200);

        } catch (QueryException $e) {
            return response()->json([
                "status" => "false",
                "message" => "User cannot be deleted because is being used in another table"
            ], 409);
        } catch (Exception $e) {
            return response()->json([
                "status" => "false",
                "message" => "Failed to delete user",
                "error" => $e->getMessage()
            ], 500);
        }
    }
}
