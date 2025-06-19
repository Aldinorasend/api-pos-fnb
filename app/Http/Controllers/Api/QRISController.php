<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class QRISController extends Controller
{

    public function login() {
        $response = Http::withHeaders([
            // 'Accept' => 'application/json, text/plain, */*',
            // 'Accept-Language' => 'en-US,en;q=0.5',
            // 'Accept-Encoding' => 'gzip, deflate, br, zstd',
            // 'Origin' => 'https://qr.klikbca.com',
            // 'Referer' => 'https://qr.klikbca.com/',
            // 'Sec-Fetch-Dest' => 'empty',
            // 'Sec-Fetch-Mode' => 'cors',
            // 'Sec-Fetch-Site' => 'same-site',
            // 'Priority' => 'u=1',
            // 'Connection' => 'keep-alive',
        ])->asForm()->post('https://messi.klikbca.com/messi.api.gateway/v1/sso/auth/realms/bca/protocol/openid-connect/token', [
            // 'username' => 'TlRRME1qTmhOalkwWW1FME9XSmlPQT09OjpOelkzTm1ZM04yRXlaakZoWkdRMllnPT06OjlJSmFwYi9xaHdsalVlN20wcldQZ0FjQW40ZW41K0JtcEVveWRBWnRXVU1UNDdNSTU2YjR3R0xDMVRpZ3kxYTQ%3D',
            // 'password' => 'TlRRME1qTmhOalkwWW1FME9XSmlPQT09OjpOelkzTm1ZM04yRXlaakZoWkdRMllnPT06OkF5UkFhVStTMERxamlSZndma0JLeEE9PQ%3D%3D',
            // 'hash_key' => 'Tm1JMk1qUmpNRFkxTnpnNFpETTBNZz09OjpZakZrWlRObE4yUmhZekkwWldRME53PT06OlJUaE9TR0Q3aE9DZEZuS2wvb3htTEdxelFMK0tmcTc4MmxxUWFyMmlicHBBWGQ4R3EyMUh2d1pDWDg4cldCUDZhQVJpVXNXZ29ybkNUY2VOV0tuSVl4UFBaSlpoQ0Q5a2hmV3pINGp4SmFJPQ',
            'username' => 'novian.anggis@gmail.com',
            'password' => 'L4k3s1d3',
            'hash_key' => 'tes',
            
            // 'username' => urlencode('TlRRME1qTmhOalkwWW1FME9XSmlPQT09OjpOelkzTm1ZM04yRXlaakZoWkdRMllnPT06OjlJSmFwYi9xaHdsalVlN20wcldQZ0FjQW40ZW41K0JtcEVveWRBWnRXVU1UNDdNSTU2YjR3R0xDMVRpZ3kxYTQ%3D'),
            // 'password' => urlencode('TlRRME1qTmhOalkwWW1FME9XSmlPQT09OjpOelkzTm1ZM04yRXlaakZoWkdRMllnPT06OkF5UkFhVStTMERxamlSZndma0JLeEE9PQ%3D%3D'),
            // 'hash_key' => urlencode('Tm1JMk1qUmpNRFkxTnpnNFpETTBNZz09OjpZakZrWlRObE4yUmhZekkwWldRME53PT06OlJUaE9TR0Q3aE9DZEZuS2wvb3htTEdxelFMK0tmcTc4MmxxUWFyMmlicHBBWGQ4R3EyMUh2d1pDWDg4cldCUDZhQVJpVXNXZ29ybkNUY2VOV0tuSVl4UFBaSlpoQ0Q5a2hmV3pINGp4SmFJPQ'),

            'grant_type' => 'password',
            'scope' => 'openid',
            'xoid' => 'TlRRME1qTmhOalkwWW1FME9XSmlPQT09OjpOelkzTm1ZM04yRXlaakZoWkdRMllnPT06OlBwRytPc2FRam1FbG9LTWhPYTMxaWZQaHhZN0ZMQ1VYaU1VeUl2V0lOTDA9',
        ]);


        // Handle the response
        if ($response->successful()) {
            // Successful response
            return $response->json();
        } else {
            // Handle error
            return $response->body();
        }

    }

    public function fetchTransactions()
    {
        $this->login();

        dd($this->login());
        // Define the request URL
        $url = 'https://ebanksvc.bca.co.id/mcb-resource/v1.0.0/transactions/QRMS/list';

        // Define the request body as an array
        $data = [
            "startDate" => "2024-08-23:00:00:00",
            "endDate" => "2024-08-23:15:20:08",
            "filter" => "",
            "lastTotalTransaction" => 0,
            "outletForSummary" => [
                [
                    "mid" => "TnpVMU1tTTBPREppWldSalpUZ3dOZz09OjpaV0l6WkRObVl6RTNaREkyWm1VMU1RPT06OlRjaFN6ZjhRalNtdFNlajBWVUtKZnc9PQ==",
                    "midInduk" => "TnpVMU1tTTBPREppWldSalpUZ3dOZz09OjpaV0l6WkRObVl6RTNaREkyWm1VMU1RPT06OklTemMrOGw1YWI3ZDVxUUtyQytqK2c9PQ==",
                    "outletName" => "TnpVMU1tTTBPREppWldSalpUZ3dOZz09OjpaV0l6WkRObVl6RTNaREkyWm1VMU1RPT06Oi9JSE9Cc2lZazdPVmpXWGQrbXArNFFXNUtvQWNIWXVKYW5rcmVpdktUK3dCWkVVNEtWREVqVWo5YkpqVTQvQ1Y=",
                    "qrisNmid" => "TnpVMU1tTTBPREppWldSalpUZ3dOZz09OjpaV0l6WkRObVl6RTNaREkyWm1VMU1RPT06OjBWQ04yZ3F5ckR5VlBBYVcxMUc4VGtaY0ZlbnZLdnZhQjNOTGdVa3hJSHM9",
                    "jenisOutlet" => "TnpVMU1tTTBPREppWldSalpUZ3dOZz09OjpaV0l6WkRObVl6RTNaREkyWm1VMU1RPT06OmdPZDVUaEVscy9Icnhvc0c5akRJTTV3MUdabTNUaXFLYkRoVDl0SzNLSkU9",
                    "iscicilan0" => false,
                    "mccId" => "TnpVMU1tTTBPREppWldSalpUZ3dOZz09OjpaV0l6WkRObVl6RTNaREkyWm1VMU1RPT06OmZPZllORVhvQzkwVCtFVCtocDcvVFE9PQ=="
                ]
            ],
            "outletForList" => [
                "TnpVMU1tTTBPREppWldSalpUZ3dOZz09OjpaV0l6WkRObVl6RTNaREkyWm1VMU1RPT06OlRjaFN6ZjhRalNtdFNlajBWVUtKZnc9PQ=="
            ],
            "page" => 1,
            "size" => 30,
            "sort" => ""
        ];

        // Define the Bearer token
        $token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIyZ0FLQ2pUeWtyQWVLcXAwYWc5SkFWOW1hamJIZ0hJcjJSblhTbmhPSEhnIn0.eyJleHAiOjE3MjU5NjA4MDAsImlhdCI6MTcyNTk1OTAwMCwianRpIjoiNTAwZjBhNjQtN2I1ZS00ZjAzLWI1NzQtY2VkOGU1YTM5ZWVkIiwiaXNzIjoiaHR0cHM6Ly9tZXNzaWtjLmludHJhLmJjYS5jby5pZDo1NTMyOC9hdXRoL3JlYWxtcy9iY2EiLCJhdWQiOlsiYmNhLW1jYiIsInJlYWxtLW1hbmFnZW1lbnQiLCJhZG1pbi1jbGkiLCJhY2NvdW50Il0sInN1YiI6ImYxNGIwYTk1LTU0YmUtNDAzYS1iMjk0LTA5ODc1ZTBlODg2ZSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImJjYS1xcm1zIiwic2Vzc2lvbl9zdGF0ZSI6Ijg3Y2NkOTgzLWYzNzAtNDBkYS1hMzc5LTQzYTI2ODViNzUzOSIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiYW5nZ290YSIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJiY2EtbWNiIjp7InJvbGVzIjpbImthc2lyIl19LCJyZWFsbS1tYW5hZ2VtZW50Ijp7InJvbGVzIjpbIm1hbmFnZS11c2VycyJdfSwiYmNhLXFybXMiOnsicm9sZXMiOlsia2FzaXIiXX0sImFkbWluLWNsaSI6eyJyb2xlcyI6WyJvdHAiXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJpc2V4aXN0aW5nIjoiZmFsc2UiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJMQUtFIFNJREUiLCJpc25ldyI6ImZhbHNlIiwicHJlZmVycmVkX3VzZXJuYW1lIjoibm92aWFuLmFuZ2dpc0BnbWFpbC5jb20iLCJnaXZlbl9uYW1lIjoiTEFLRSBTSURFIiwiZW1haWwiOiJub3ZpYW4uYW5nZ2lzQGdtYWlsLmNvbSJ9.Gfm2kok-pbud9EQgrRYyXE-acd4uKL8czOcJB9hK2MqfEBMzQ03xi_PIT7dxfR5cp-N_ieckNly1qAm51uObgm4lzh_LZ01ZtzdoyUpjq00lWgdLhD5nPquV9AmxOoynnt2EEGG1nfYtGR1AUjC6bTtGkNMqJafkWNEKzS5Vk6Q4gnoz4ykLx9OsFSsejb6XaiRwSZGGt8NN-OYqH2HPf9yV52tH6v3xxl_xW2JhRQfu0mklKN-7UJ9LBtjEaYXKn3Tqzec5UGDALCyRbdpH8dWtNQHvwlNhqAWpBuy4UHYUrC2tk57nsiloEL3UuiUWFEcia4sxznG_A0-RwysE6g';

        // Make the POST request using Laravel's Http client
        $response = Http::withToken($token)
            ->post($url, $data);

        // Return the response from the API
        return $response->json(); // or $response->body(), depending on how you want to handle the response
    }

}
