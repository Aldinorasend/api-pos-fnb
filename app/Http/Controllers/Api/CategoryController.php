<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    public function index()
    {
        try {
            $data = Category::orderByDesc('created_at')->get() ;

            return response()->json(
                [
                    "message" => "Success get category",
                    "status" => "success",
                    "data" => $data
                ],
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "Failed to get category",
                    "status" => "failed",
                    "error" => $th->getMessage()
                ],
                500
            );
        }
    }

    public function show($id)
    {
        try {
            $data = Category::find($id);

            return response()->json(
                [
                    "message" => "success to get category by id",
                    "status" => "success",
                    "data" => $data
                ],
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "failed to get category by id",
                    "status" => 'failed',
                    "error" => $th->getMessage()
                ],
                500
            );
        }
    }

    public function getCategoriesByOutlet($outlet_id)
    {
        try {
            $categories = Category::where('outlet_id', $outlet_id)->orderByDesc('created_at')->get();

            return response()->json([
                'message' => 'success get categories by outlet',
                'status' => 'success',
                'data' => $categories
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'failed get categories by outlet',
                'status' => 'failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'category_name' => 'required|string|max:255',
                'is_food' => 'required|boolean',
                'outlet_id' => 'required|exists:outlet,id'
            ]);

            Category::create([
                'category_name' => $validatedData['category_name'],
                'is_food' => $validatedData['is_food'],
                'outlet_id' => $validatedData['outlet_id']
            ]);

            return response()->json([
                'message' => 'success on create category',
                'status' => 'success'
            ], 200);
        } catch (ValidationException $e) {
            return response()->json(
                [
                    "message" => "Validation failed",
                    "status" => false,
                    "errors" => $e->errors()
                ],
                422
            );
        } catch (Exception $th) {
            return response()->json([
                'message' => 'failed to create category',
                'status' => 'failed',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $category = Category::find($id);
            $category->category_name = $request->category_name;
            $category->is_food = $request->is_food;
            $category->save();

            return response()->json(
                [
                    "message" => "Success on update category",
                    "status" => "success"
                ], 200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "Failed on update category",
                    "status" => "failed",
                    "error" => $th->getMessage()
                ], 500
            );
        }
    }

    public function destroy($id)
    {
        try {
            $hasProducts = Product::where('category_id', $id)->exists();
            if ($hasProducts) {
                return response()->json([
                    'message' => 'Category is used in product, cannot be deleted',
                    'status' => 'error',                    
                ], 409);
            }

            Category::destroy($id);

            return response()->json(
                [
                    "message" => "success on delete category by id",
                    "status" => "success"
                ],
                200
            );
        } catch (Exception $th) {
            return response()->json(
                [
                    "message" => "failed to delete category by id",
                    "status" => "failed",
                    "error" => $th->getMessage()
                ],
                500
            );
        }
    }
}
