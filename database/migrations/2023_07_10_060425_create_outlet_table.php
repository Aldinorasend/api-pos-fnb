<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOutletTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('outlet', function (Blueprint $table) {
            $table->string('id' , 15)->primary();
            $table->string('outlet_name');
            $table->string('email');
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_dinein');
            $table->boolean('is_label')->default(true);
            $table->boolean('is_kitchen');
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
        Schema::dropIfExists('outlet');
    }
}
