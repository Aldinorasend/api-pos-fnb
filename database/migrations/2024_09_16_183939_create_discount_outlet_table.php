<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDiscountOutletTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('discount_outlet', function (Blueprint $table) {
            $table->foreignId('discount_id')->constrained()->onDelete('cascade');
            $table->string('outlet_id', 15);
            $table->foreign('outlet_id')->references('id')->on('outlet')->onDelete('cascade')->onUpdate('cascade');
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
        Schema::dropIfExists('discount_outlet');
    }
}
