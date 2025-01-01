/** @odoo-module **/

import { Component, onWillStart, onMounted, useRef,useState ,useEffect,xml} from "@odoo/owl";
import { session } from "@web/session";
import { loadJS } from '@web/core/assets'
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { jsonrpc } from "@web/core/network/rpc_service";
import { _t } from "@web/core/l10n/translation";


export class ProductHistory extends Component {
    setup() {



        onWillStart(async ()=>{
            this.renderproductdetails()
           
        })


        this.state=useState({
            products:[],
            selectedProductMoves: [], // Stores move history of the selected product
            showModal: false, // Controls whether the modal is visible
            selectProductLocation:[],
            showLocationModal: false,
        })
    }


    
    
    renderproductdetails = async ()=>{
        try{
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.quant',
                method: 'getproduct_details',
                args: [[]],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {},
            });
            console.log("enter the result", result)
             if ( result.length > 0){
                console.log("enter the result", result)
                this.state.products=result
                console.log("enter the state", this.state)
             }
             else{
                console.log("its not working in product length")
             }
        }
        catch{
            console.error("Error is coming in when try to catch the product details from renderproductdetails")
        }

   }


  fetchMoveHistory= async(productId)=> {

    if(this.props.rendermovehistory){
        console.log("i am in movement history")
        this.props.rendermovehistory(productId)
       
    }

    // console.log("what is the product id ", productId)
    // try {
    //     const result = await jsonrpc('/web/dataset/call_kw', {
    //         model: 'stock.quant',
    //         method: 'getproduct_wise_moveHistoryPlus',
    //         args: [[],productId], // Pass the product ID as an argument
    //         kwargs: {},
    //     });
    //     console.log("Fetched move history for product ID:", productId, result);
    //     this.state.selectedProductMoves = result;
    //     this.state.showModal = true; // Open the modal

    //     console.log("history state",this.state)
    // } catch (error) {
    //     console.error("Error fetching move history:", error);
    // }
}


    fetchStockLocations = async(productId)=>{
        console.log("what is the product id ", productId)
    try {
        const result = await jsonrpc('/web/dataset/call_kw', {
            model: 'stock.quant',
            method: 'getproduct_stock_location',
            args: [[],productId], // Pass the product ID as an argument
            kwargs: {},
        });
        console.log("Fetched move history for product ID:", productId, result);
        this.state.selectProductLocation = result;
        this.state.showLocationModal = true; // Open the modal

        console.log("history state",this.state)
    } catch (error) {
        console.error("Error fetching move history:", error);
    }

    }

    closeModal() {
        this.state.showModal = false; // Close the modal
        
    }
    closeLocationModal(){
        this.state.showLocationModal = false; // Open the modal
    }
    
}
ProductHistory.template = xml `<!-- Page wrapper/Container Section -->
                                        <div class="container1">
                                         <div class="btn-box-div" style="float: right; padding-bottom: 41px;">
                                            <form class ="form-search" role="search">
                                                <label class ="label-search" for="search">Search for Product</label>
                                                <input class="search-input" id="search" type="search" placeholder="Search Product" t-on-change="(event) => onchangesearch(event)" />
                                                <button class="search-btn1" type="submit" t-on-click="onclicksearch">Go</button>    
                                            </form>
                                        </div>
      
        <!-- Responsive Table for Product Details -->
        <table class="responsive-table">
            <thead class="responsive-table__head">
                <tr class="responsive-table__row">
                    <th class="responsive-table__head__title product-code">Product Code</th>
                    <th class="responsive-table__head__title product-name">Product Name</th>
                    <th class="responsive-table__head__title onhand-stock">OnHand Stock</th>
                   
                    <th class="responsive-table__head__title move-history">Stock Location</th>
                </tr>
            </thead>
            <tbody class="responsive-table__body">
                <t t-foreach="state.products" t-as="product" t-key="product.product_id">
                    <tr class="responsive-table__row">
                        <td class="responsive-table__body__text product-code">
                            <t t-esc="product.product_code || 'N/A'" />
                        </td>
                        <td class="responsive-table__body__text product-name">
                            <t t-esc="product.product_name['en_US'] || 'Unknown'" />
                        </td>
                        <td class="responsive-table__body__text onhand-stock">
                            <t t-esc="product.total_on_hand_quantity" />
                        </td>
                        
                        <td class="responsive-table__body__text move-history">
                            <button class="btn btn-primary" t-on-click="() => fetchStockLocations(product.product_id)">
                                Stock Locations
                            </button>
                        </td>
                        

                    </tr>
                </t>
            </tbody>
        </table>

      

<!-- Modal for Stock Locations -->
    <t t-if="state.showLocationModal">
        <div class="modal fade show" style="display: block;" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Location Details</h5>
                        <button type="button" class="close" aria-label="Close" t-on-click="closeLocationModal">
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Location Name</th>
                                    <th>Rack Name</th>
                                    <th>Row-Col</th>
                                    <th>Total On-Hand Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                <t t-foreach="state.selectProductLocation" t-as="loc" t-key="loc.location_id">
                                    <tr>
                                        <td><t t-esc="loc.product_name['en_US']" /></td>
                                        <td><t t-esc="loc.location_name" /></td>
                                        <td><t t-esc="loc.rack_name" /></td>
                                        <td><t t-esc="loc.row_col" /></td>
                                        <td><t t-esc="loc.total_on_hand_quantity" /></td>
                                    </tr>
                                </t>
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" t-on-click="closeLocationModal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade show"></div>
    </t>


        <!-- Modal Backdrop -->
        <t t-if="state.showModal">
            <div class="modal-backdrop fade show"></div>
        </t>
    </div>`

registry.category("actions").add("productHistory", ProductHistory);


/* Please ❤ this if you like it! 😊 */

// Select thead titles from Dom
const headTitleName = document.querySelector(
	".responsive-table__head__title--name"
);
const headTitleStatus = document.querySelector(
	".responsive-table__head__title--status"
);
const headTitleTypes = document.querySelector(
	".responsive-table__head__title--types"
);
const headTitleUpdate = document.querySelector(
	".responsive-table__head__title--update"
);
const headTitleCountry = document.querySelector(
	".responsive-table__head__title--country"
);

// Select tbody text from Dom
const bodyTextName = document.querySelectorAll(
	".responsive-table__body__text--name"
);
const bodyTextStatus = document.querySelectorAll(
	".responsive-table__body__text--status"
);
const bodyTextTypes = document.querySelectorAll(
	".responsive-table__body__text--types"
);
const bodyTextUpdate = document.querySelectorAll(
	".responsive-table__body__text--update"
);
const bodyTextCountry = document.querySelectorAll(
	".responsive-table__body__text--country"
);

// Select all tbody table row from Dom
const totalTableBodyRow = document.querySelectorAll(
	".responsive-table__body .responsive-table__row"
);

// Get thead titles and append those into tbody table data items as a "data-title" attribute
for (let i = 0; i < totalTableBodyRow.length; i++) {
	bodyTextName[i].setAttribute("data-title", headTitleName.innerText);
	bodyTextStatus[i].setAttribute("data-title", headTitleStatus.innerText);
	bodyTextTypes[i].setAttribute("data-title", headTitleTypes.innerText);
	bodyTextUpdate[i].setAttribute("data-title", headTitleUpdate.innerText);
	bodyTextCountry[i].setAttribute("data-title", headTitleCountry.innerText);
}




