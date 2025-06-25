<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Modifier;
use App\Models\Outlet;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Console\Output\ConsoleOutput;
use Illuminate\Support\Facades\Validator;
class OutletController extends Controller
{
    public function index()
    {
        try {
            // Retrieve all outlets with related users
            $outlets = Outlet::with('users')->orderByDesc('created_at')->get();

            // Add the complete image URL to each outlet
            $outlets->transform(function ($outlet) {
                $outlet->image_url = asset('storage/' . $outlet->image);
                return $outlet;
            });

            return response()->json(
                [
                    "message" => "Success get all outlets",
                    "status" => true,
                    "data" => $outlets
                ],
                200
            );
        } catch (Exception $e) {
            return response()->json(
                [
                    "message" => "Failed to get all outlets",
                    "status" => false,
                    "error" => $e->getMessage()
                ],
                500
            );
        }
    }

    public function getCurrentUserOutlet(Request $request)
    {
        try {
            $userId = $request->user()->id;
            $outlets = Outlet::whereHas('users', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })->get();

            if ($outlets->isEmpty()) {
                return response()->json(
                    [
                        "message" => "No outlets found for the user",
                        "status" => false
                    ],
                    404
                );
            }
            return response()->json(
                [
                    "message" => "Success get outlets by user",
                    "status" => true,
                    "data" => $outlets
                ],
                200
            );
        } catch (Exception $e) {
            return response()->json(
                [
                    "message" => "Failed to get outlets by user",
                    "status" => false,
                    "error" => $e->getMessage()
                ],
                500
            );
        }
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'outlet_name' => 'required|string|max:255',
                'email' => 'required|email|unique:outlet',
                'image' => 'image|mimes:jpeg,png,jpg,gif,svg',
                'latitude' => 'sometimes|nullable|string|max:255',
                'longitude' => 'sometimes|nullable|string|max:255',
                'is_dinein' => 'required|nullable|boolean',
                'is_label' => 'required|nullable|boolean',
                'is_kitchen' => 'required|nullable|boolean',
            ]);

            // Proses upload gambar jika ada
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('outlet_images', 'public');
                $validatedData['image'] = $imagePath;
            }

            $outlet = Outlet::create([
                'outlet_name' => $validatedData['outlet_name'],
                'email' => $validatedData['email'],
                'image' => $validatedData['image'] ?? null,
                'latitude' => $validatedData['latitude'] ?? null,
                'longitude' => $validatedData['longitude'] ?? null,
                'is_dinein' => $validatedData['is_dinein'],
                'is_label' => $validatedData['is_label'],
                'is_kitchen' => $validatedData['is_kitchen'],
            ]);

            return response()->json(
                [
                    "message" => "Success on creating new outlet",
                    "status" => true,
                    "data" => $outlet
                ],
                200
            );
        } catch (ValidationException $e) {
            return response()->json(
                [
                    "message" => "Validation failed",
                    "status" => false,
                    "errors" => $e->errors()
                ],
                422
            );
        } catch (Exception $e) {
            return response()->json(
                [
                    "message" => "Failed to add outlet",
                    "status" => false,
                    "error" => $e->getMessage()
                ],
                500
            );
        }
    }

    public function show($id)
    {
        try {
            $outlet = Outlet::where('id', $id)->with('users')->first();

            if ($outlet) {
                $outlet->image_url = asset('storage/' . $outlet->image);

                return response()->json(
                    [
                        "message" => "Success get outlet",
                        "status" => true,
                        "data" => $outlet
                    ],
                    200
                );
            }

            return response()->json(
                [
                    "message" => "Outlet not found",
                    "status" => false
                ],
                404
            );
        } catch (Exception $e) {
            return response()->json(
                [
                    "message" => "Failed to get outlet",
                    "status" => false,
                    "error" => $e->getMessage()
                ],
                500
            );
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $outlet = Outlet::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'outlet_name' => 'sometimes|required|string|max:255',
                'email' => ['sometimes', 'required', 'email', Rule::unique('outlet')->ignore($id)],
                'image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'latitude' => 'sometimes|nullable|string|max:255',
                'longitude' => 'sometimes|nullable|string|max:255',
                'is_dinein' => 'sometimes|nullable|boolean',
                'is_label' => 'sometimes|nullable|boolean',
                'is_kitchen' => 'sometimes|nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    "message" => "Validation failed",
                    "status" => false,
                    "errors" => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($outlet->image && Storage::disk('public')->exists($outlet->image)) {
                    Storage::disk('public')->delete($outlet->image);
                }
                
                // Save new image
                $imagePath = $request->file('image')->store('outlet_images', 'public');
                $data['image'] = $imagePath;
            }

            $outlet->update($data);

            return response()->json([
                "message" => "Success on updating outlet",
                "status" => true,
                "data" => $outlet
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                "message" => "Failed to update outlet",
                "status" => false,
                "error" => $e->getMessage()
            ], 500);
        }
    }

    public function updateOutletStatus($id)
    {
        try {
            $outlet = Outlet::findOrFail($id);
            $outlet->is_active = !$outlet->is_active;
            $outlet->save();

            return response()->json([
                'message' => 'Outlet status updated',
                'status' => 'success'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Outlet not found',
                'status' => 'error',                
            ], 404);
        } catch(Exception $e) {
            return response()->json([
                'message' => 'Failed to update outlet status',
                'status' => 'error',                
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $outlet = Outlet::findOrFail($id);
            Modifier::where('outlet_id', $id)->delete();
            $outlet->delete();

            return response()->json([
                "status" => true,
                "message" => "Success delete outlet"
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'false',
                'message' => 'Outlet not found'
            ], 404);
    
        } catch (QueryException $e) {
            return response()->json([
                'status' => 'false',
                'message' => 'Outlet cannot be deleted because is being used in another table'
            ], 409);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'false',
                'message' => 'Failed to delete outlet',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}