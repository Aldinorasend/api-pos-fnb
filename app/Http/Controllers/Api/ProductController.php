<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderDetail;
use App\Models\Product;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index()
    {
        try {
            $products = Product::with(['modifiers', 'outlet', 'variants'])
                ->orderByDesc('created_at')
                ->get()
                ->map(function($product) {
                    $product->category_name = $product->category->category_name;
                    return $product;
            });

            return response()->json([
                'message' => 'Products fetched successfully',
                'status' => 'success',
                'data' => $products
            ]);
        } catch(Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch products: ' . $e->getMessage(),
                'status' => 'error',                
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:category,id',
            'description' => 'required|string',
            'image' => 'nullable|image',
            'is_active' => 'required|boolean',
            'outlet_id' => 'required|exists:outlet,id',
            'variants' => 'sometimes|min:1|array',
            'variants.*.name' => 'required|max:255',
            'variants.*.price' => 'required|integer',
            'modifiers' => 'array|min:1|sometimes',
            'modifiers.*' => 'integer|exists:modifiers,id'
        ]);

        //price attribute is mandatory if and only if the variants attribute is undefined or null
        $validator->sometimes('price', 'required|integer', function ($input) {
            return !isset($input->variants);
        });

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            //store new images in public/storage/
            if($request->image){
                $path = $request->file('image')->store('images/product', 'public');
            }
            
            //store new product in database
            $product = Product::create([
                'name' => $request->name,
                'category_id' => $request->category_id,
                'description' => $request->description,
                'image' => $path ?? '',
                'is_active' => $request->is_active,
                'outlet_id' => $request->outlet_id,
            ]);

            /**
             * 
             *  if variants is exist then input the variants in product_variants table
             *  else input with value of "name" is "default" and "price" with the input from the request
             * 
             * */ 
            if ($request->variants) {
                foreach ($request->variants as $variantData) {
                    $product->variants()->create($variantData);
                }
            } else {
                $product->variants()->create(["name" => "default", "price" => $request->price]);
            }

            //input the modifier to modifiers table
            if ($request->has('modifiers')) {
                $product->modifiers()->sync($request->modifiers);
            }

            return response()->json([
                'message' => 'Product created successfully',
                'status' => 'success',
                'data' => $product->load('variants', 'modifiers', 'outlet')
            ], 201);
        } catch(Exception $e) {
            return response()->json([
                'message' => 'Failed to create product: ' . $e->getMessage(),
                'status' => 'error',                
            ], 500);
        }
    }

    public function getAllAvailableProduct()
    {
        try {
            $products = Product::with(['modifiers', 'outlet', 'variants'])
                ->where('is_active', true)
                ->orderByDesc('created_at')
                ->get()
                ->map(function($product) {
                    $product->category_name = $product->category->category_name;
                    return $product;
            });

            return response()->json([
                'message' => 'Available products fetched successfully',
                'status' => 'success',
                'data' => $products
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Products not found: ' . $e->getMessage(),
                'status' => 'error',                
            ], 404);
        } catch(Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch products: ' . $e->getMessage(),
                'status' => 'error',                
            ], 500);
        }
    }

    public function getAllProductByOutlet(Request $request, $id) 
    {
        try {
            // Get order_by and sort_order parameters from the request
            $orderBy = $request->get('order', 'created_at'); // Default to 'created_at'
            $sortOrder = $request->get('sort', 'desc');    // Default to 'desc'
    
            $products = Product::with(['modifiers', 'variants'])
                ->where('outlet_id', $id)
                ->orderBy($orderBy, $sortOrder)
                ->get()
                ->map(function($product) {
                    $product->category_name = $product->category->category_name;
                    return $product;
                }
            );
    
            return response()->json([
                'message' => 'Products by outlet fetched successfully',
                'status' => 'success',
                'data' => $products
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Products not found: ' . $e->getMessage(),
                'status' => 'error',
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch products: ' . $e->getMessage(),
                'status' => 'error',
            ], 500);
        }
    }
    

    public function updateProductAvailability($id)
    {
        try {
            $product = Product::findOrFail($id);
            $product->is_active = !$product->is_active;
            $product->save();

            return response()->json([
                'message' => 'Product availability updated successfully',
                'status' => 'success',
                'data' => $product
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Product not found: ' . $e->getMessage(),
                'status' => 'error',                
            ], 404);
        } catch(Exception $e) {
            return response()->json([
                'message' => 'Failed to update product availability: ' . $e->getMessage(),
                'status' => 'error',                
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $product = Product::with(['modifiers', 'outlet', 'variants'])->findOrFail($id);

            return response()->json([
                'message' => 'Product fetched successfully',
                'status' => 'success',
                'data' => $product
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Product not found: ' . $e->getMessage(),
                'status' => 'error',                
            ], 404);
        } catch(Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch product: ' . $e->getMessage(),
                'status' => 'error',                
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:category,id',
            'description' => 'required|string',
            'image' => 'nullable|image',
            'remove_image' => 'sometimes|boolean',
            'is_active' => 'required|boolean',
            'outlet_id' => 'sometimes|exists:outlet,id',
            'variants' => 'sometimes|min:1|array',
            'variants.*.name' => 'required|max:255',
            'variants.*.price' => 'required|integer',
            'modifiers' => 'array|min:1|sometimes',
            'modifiers.*' => 'integer|exists:modifiers,id'
        ]);

        $validator->sometimes('price', 'required|integer', function ($input) {
            return !isset($input->variants);
        });
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $product = Product::find($id); 

            if (is_null($product)) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            /**
             * image logic 
             */
            if ($request->has('remove_image') && $request->remove_image) {
                if ($product->image && Storage::disk('public')->exists($product->image)) {
                    Storage::disk('public')->delete($product->image);
                    $product->image = null;
                }
            } else if ($request->hasFile('image')) {
                if ($product->image && Storage::disk('public')->exists($product->image)) {
                    Storage::disk('public')->delete($product->image);
                }
                $path = $request->file('image')->store('images/product', 'public');
                $product->image = $path;
            }

            /**
             * if outlet_id is not exist then store with previous one
             */
            if (!$request->outlet_id){
                $request->outlet_id = $product->outlet_id;
            }

            $product->update($request->only('name', 'category_id', 'description', 'is_active', 'outlet_id'));

            /**
             * variants update
             */
            $product->variants()->delete();
            if ($request->has('variants')) {
                foreach ($request->variants as $variant) {
                    $product->variants()->create($variant);
                }
            } else {
                $product->variants()->create(["name" => "default", "price" => $request->price]);
            }

            if (!$request->has('modifiers')) {
                $request->modifiers = [];
            }
            $product->modifiers()->sync($request->modifiers);

            return response()->json([
                'message' => 'Product updated successfully',
                'status' => 'success',
                'data' => $product->load('variants', 'modifiers', 'outlet')
            ]);
        } catch(ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Product not found: ' . $e->getMessage(),
                'status' => 'error',                
            ], 404);
        } catch(Exception $e) {
            return response()->json([
                'message' => 'Failed to update product: ' . $e->getMessage(),
                'status' => 'error',                
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);
            Storage::disk('public')->delete($product->image);
            $product->delete();

            return response()->json([
                'message' => 'Product deleted successfully',
                'status' => 'success',                
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Product not found: ' . $e->getMessage(),
                'status' => 'error',                
            ], 404);
        } catch (QueryException $e) {
            return response()->json([
                'status' => 'false',
                'message' => 'Product cannot be deleted because is being used in another table'
            ], 409);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to delete product: ' . $e->getMessage(),
                'status' => 'error',                
            ], 500);
        }
    }
}
