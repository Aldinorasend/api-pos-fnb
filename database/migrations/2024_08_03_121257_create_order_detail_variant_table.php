<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrderDetailVariantTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('order_detail_variant', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_detail_id')->references('id')->on('order_details')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('variant_name');
            $table->string('variant_price');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('order_detail_variant');
    }
}
