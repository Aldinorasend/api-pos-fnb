<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreModifierRequest;
use App\Http\Requests\UpdateModifierRequest;
use App\Models\Modifier;
use App\Models\ProductModifier;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ModifierController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $modifiers = Modifier::with('modifierOptions')->orderByDesc('created_at')->get();
            return response()->json([
                'message' => 'Modifiers fetched successfully',
                'status' => 'success',
                'data' => $modifiers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch modifiers: ' . $e->getMessage(),
                'status' => 'error',

            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreModifierRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreModifierRequest $request)
    {
        try {
            $modifier = Modifier::create($request->validated());

            foreach ($request->modifier_options as $option) {
                $modifier->modifierOptions()->create($option);
            }

            return response()->json([
                'message' => 'Modifier created successfully',
                'status' => 'success',
                'data' => $modifier->load('modifierOptions')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create modifier: ' . $e->getMessage(),
                'status' => 'error',
            ], 500);
        }
    }

    /**
     * Display the available product
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function getAllModifierByOutlet($id)
    {
        try {
            $modifiers = Modifier::with(['modifierOptions'])
                ->where('outlet_id', $id)
                ->orderByDesc('created_at')
                ->get();
            return response()->json([
                'message' => 'Modifiers by outlet fetched successfully',
                'status' => 'success',
                'data' => $modifiers
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Modifiers not found: ' . $e->getMessage(),
                'status' => 'error',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch modifiers: ' . $e->getMessage(),
                'status' => 'error',
            ], 500);
        }
    }

    /**
     * Update assigned products for the given modifier
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateAssignedProducts(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'products' => 'present|array',
                'products.*' => 'exists:products,id'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $modifier = Modifier::findOrFail($id);

            $modifier->products()->sync($request->products);

            return response()->json([
                'message' => 'Products assigned to modifier successfully updated',
                'status' => 'success',
                'data' => $modifier->load('products')
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Modifier not found: ' . $e->getMessage(),
                'status' => 'error',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update assigned products: ' . $e->getMessage(),
                'status' => 'error',
            ], 500);
        }
    }


    /**
     * Display the modifier with all products and their assignment status
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function showModifierWithAllProducts($id)
    {
        try {
            $modifier = Modifier::findOrFail($id);

            $products = \App\Models\Product::with('modifiers')
                ->where('outlet_id', $modifier->outlet_id)
                ->get()
                ->map(function ($product) use ($modifier) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'is_assigned' => $product->modifiers->contains($modifier->id)
                    ];
                });

            return response()->json([
                'message' => 'Modifier and products fetched successfully',
                'status' => 'success',
                'data' => [
                    'modifier' => $modifier,
                    'products' => $products
                ]
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Modifier not found: ' . $e->getMessage(),
                'status' => 'error',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch modifier and products: ' . $e->getMessage(),
                'status' => 'error',
            ], 500);
        }
    }


    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $modifier = Modifier::with('modifierOptions')->findOrFail($id);
            return response()->json([
                'message' => 'Modifier fetched successfully',
                'status' => 'success',
                'data' => $modifier
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Modifier not found: ' . $e->getMessage(),
                'status' => 'error',

            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch modifier: ' . $e->getMessage(),
                'status' => 'error',
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateModifierRequest $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateModifierRequest $request, $id)
    {
        try {
            $modifier = Modifier::findOrFail($id);
            $modifier->update($request->validated());

            if ($request->has('modifier_options')) {
                $modifier->modifierOptions()->delete();
                foreach ($request->modifier_options as $option) {
                    $modifier->modifierOptions()->create($option);
                }
            }
            return response()->json([
                'message' => 'Modifier updated successfully',
                'status' => 'success',
                'data' => $modifier->load('modifierOptions')
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Modifier not found: ' . $e->getMessage(),
                'status' => 'error',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update modifier: ' . $e->getMessage(),
                'status' => 'error',
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $modifier = Modifier::findOrFail($id);

            $isUsed = ProductModifier::where('modifier_id', $id)->exists();
            if ($isUsed) {
                return response()->json([
                    'message' => 'Modifier is used in products and cannot be deleted',
                    'status' => 'error',
                ], 409);
            }
            $modifier->delete();
            return response()->json([
                'message' => 'Modifier deleted successfully',
                'status' => 'success',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Modifier not found: ' . $e->getMessage(),
                'status' => 'error',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete modifier: ' . $e->getMessage(),
                'status' => 'error',
            ], 500);
        }
    }
}
