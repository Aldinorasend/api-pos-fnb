<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrderTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('order', function (Blueprint $table) {
            $table->uuid("id")->primary();
            $table->string('outlet_id' , 15);
            $table->foreignId("customer_id")->references('id')->on('customer')->nullable();
            $table->integer("order_subtotal")->nullable();
            $table->integer("order_total")->nullable();
            $table->foreignId("order_payment")->references('id')->on('payments');
            $table->foreignId("order_cashier")->references('id')->on('users');
            $table->integer("order_table")->nullable();
            $table->enum("order_type" , ['dinein' , 'takeaway' , 'delivery']);
            $table->foreignId('discount_id')->nullable()->references('id')->on('discounts');
            $table->foreignId('referral_code_id')->nullable()->references('id')->on('referral_code');
            $table->enum('status' , ['paid' , 'unpaid'])->default('paid');
            $table->foreign('outlet_id')->references('id')->on('outlet');
            $table->softDeletes();
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
        Schema::dropIfExists('order');
    }
}
