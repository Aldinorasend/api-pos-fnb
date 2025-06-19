<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function loginUser(Request $req)
    {
        try {
            $validateUser = Validator::make(
                $req->all(),
                [
                    'email' => 'required|email',
                    'password' => 'required'
                ]
            );
    
            if ($validateUser->fails()) {
                return response()->json([
                    'status' => "Failed",
                    'message' => 'validation error',
                    'errors' => $validateUser->errors()
                ], 422);
            }
    
            $user = User::where("email", $req->email)->first();
    
            if (!$user || !Auth::attempt($req->only(["email", "password"]))) {
                return response()->json([
                    'status' => "Failed",
                    'message' => 'Email & Password does not match with our record.',
                ], 401);
            }
    
            if (!$user->is_active) {
                return response()->json([
                    'status' => "Failed",
                    'message' => 'Account is not active.',
                ], 403);
            }
    
            return response()->json(
                [
                    "message" => "Success on login user",
                    "status" => "Success",
                    "data" => [
                        "id" => $user->id,
                        "role_id" => $user->role_id,
                        "role_name" => $user->role_id == 1 ? "Admin" : 
                                    ($user->role_id == 2 ? "Manager" : 
                                    ($user->role_id == 3 ? "Staff" : "Unknown")),
                        "name" => $user->name,
                        "email" => $user->email,
                        "email_verified_at" => $user->email_verified_at,
                        "is_active" => $user->is_active,
                        "created_at" => $user->created_at,
                        "updated_at" => $user->updated_at
                    ],
                        
                    "token" => $user->createToken("API TOKEN")->plainTextToken
                ]
            );
        } catch (Exception $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }
}
