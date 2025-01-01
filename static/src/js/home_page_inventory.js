
/** @odoo-module **/
import { Component, useState, mount,useEffect, useRef,onWillStart,onMounted } from "@odoo/owl";
import { session } from "@web/session";
import { loadJS } from '@web/core/assets'
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { jsonrpc } from "@web/core/network/rpc_service";
import { _t } from "@web/core/l10n/translation";
// import {NewBinManagement} from './new_bin_management';
import {ExistingBinManagement} from './bin_management';
// import {RackManagement} from './rack_management';
import { SearchProduct } from "./search_product";
import { DeliveryMove } from "./delivery_move"
// import { WarehouseManagement } from "./warehouse_management";
import {ProductHistory} from './product_history';
import {MainPageInventory} from  './main_page_inventory';
import {PurchaseInventory} from './component/purchase/purchase_inventory'
import {InternalInventory} from './component/internal/internal_inventory'
import {DeliveryInventory} from './component/delivery/delivery_inventory'
import { SettingsInventory } from "./component/settings_inventory";
import {SystemSettings} from  "./component/systemconfig/systemconfig"
import { ProductPage } from "./component/product/product_list";

export class HomePageInventory extends Component{

    
    setup(){
        const initialDashboard = history.state?.activeDashboard || 'home'; // Default to HRMS
        this.state=useState({
            activeDashboard: initialDashboard,
            currentDashboard: null, // Initially, no dashboard is selected
            // NewBinManagement:NewBinManagement,
            ExistingBinManagement:ExistingBinManagement,
            // RackManagement:RackManagement,
            SearchProduct:SearchProduct,
            DeliveryMove:DeliveryMove,
            SystemSettings:SystemSettings,
            ProductPage:ProductPage,
           
            // WarehouseManagement:WarehouseManagement,
            ProductHistory:ProductHistory,
            MainPageInventory:MainPageInventory,
            PurchaseInventory:PurchaseInventory,
            InternalInventory:InternalInventory,
            DeliveryInventory:DeliveryInventory,
            SettingsInventory:SettingsInventory,
            warehouse:false,
            rack:false,
            bin:false,
            others:true,
            productHistoryInstance:false,
            selectedProductpurchase:[],
            selectedProductdelivery:[],
            title:"Dashboard",
            activeinward:false,
            activeoutward:false,
            activebinconfig:false,
            session_id:'',
            usertype:'',
            

     
        })

        this.state.session_id=session.uid
        

        onWillStart(async ()=>{
            if (!this.state.currentDashboard) {
                this.updateDashboard('home');
                
            }
          
        })
        onMounted ( ()=>{
            this.setrestriction();
        })

        window.addEventListener('popstate', (event) => {
            const activeDashboard = event.state?.activeDashboard || 'home';
            this.updateDashboard(activeDashboard);
        });


       
    }


    setrestriction=async()=>{
        
        
        const uid=this.state.session_id
        console.log("this is smy current id",uid)
        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'res.groups',
                method: 'getusergrouplist',
                args: [[],uid], // Pass the product ID as an argument
                kwargs: {},
            });
            console.log("Fetched group is  list here:", result);


            this.state.usertype=result


            if(result == 'sp'){
                alert("Welcome Admin We Are Ready to Update")
            }
            else if (result == 'admin'){
                let menu = document.getElementsByClassName('o_navbar_apps_menu')[0]
               console.log("this is my all data in the menu",menu)
               menu.style.display='none'
               let title = document.getElementsByClassName('dropdown-item')[0]
               console.log("this is my all data in the menu",title)
               title.style.paddingLeft ='15px'

            }
            else if ( result == 'emp'){
                let menu = document.getElementsByClassName('o_navbar_apps_menu')[0]
                console.log("this is my all data in the menu",menu)
                menu.style.display='none'
                let title = document.getElementsByClassName('dropdown-item')[0]
                console.log("this is my all data in the menu",title)
                title.style.paddingLeft ='15px'
            }
           
    
        } catch (error) {
            console.error("Error fetching group id :", error);
        }


       
    



    }

    resetheaderbtn=()=>{
          if(this.state.currentDashboard != "delivery" && this.state.currentDashboard != "purchase") 
          {
            this.state.activeinward=false
            this.state.activeoutward=false
          }
          else{
            if(this.state.currentDashboard=="delivery"){
                this.state.activeinward=false
            }
            else{
                this.state.activeoutward=false
            }
          }

        // if(this.state.activeinward){
        //     this.state.activeinward=false
        // }
        // if(this.state.activeoutward){
        //     this.state.activeoutward=false
        // }
    }

    updatetitle=(e)=>{
        this.state.title=e



    }

    onclickhome=()=>{
        this.updateDashboard('home');
         this.state.title="Dashboard"
         this.resetheaderbtn()
    }


    onclickproduct=()=>{
        this.updateDashboard('productpage');
         this.state.title="Product Management"
         this.resetheaderbtn()
    }
    


    onclickpurchase=()=>{
        this.updateDashboard('purchase');
        this.state.title="Stock Inward"
        this.state.activeinward=true
        this.resetheaderbtn()

    }
    onclickinternal=()=>{
        this.updateDashboard('internal');
    }
    onclickdelivery=()=>{
        this.updateDashboard('delivery');
        this.state.title="Stock Outward"
        this.state.activeoutward=true
        this.resetheaderbtn()
    }
    onclicksettings=()=>{
        this.updateDashboard('settings');
        this.state.title="Bin Configuration"
        this.state.activebinconfig=true
        this.resetheaderbtn()

    }
    onclicksystemsettings=()=>{
        this.updateDashboard('systemsettings');
        this.state.title="System Configuration"
        this.resetheaderbtn()
    }
    onclicksearch=()=>{
        this.updateDashboard('searchPro');
    }
    onclickreset=()=>{
       
        this.updateDashboard('home')
        this.state.title="Dashboard"
        
    }
    onclickview=(e)=>{
        this.updateDashboard(e);
    }

   

    rendermovehistory=async(productId)=>{
        
            console.log("what is the product id ", productId)
        try {
            const purchase1 = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.quant',
                method: 'getproduct_wise_purchasemoveHistoryPlus',
                args: [[],productId], // Pass the product ID as an argument
                kwargs: {},
            });

            const delivery1 = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.quant',
                method: 'getproduct_wise_delieverymoveHistoryPlus',
                args: [[],productId], // Pass the product ID as an argument
                kwargs: {},
            });
            console.log("Fetched move history for product ID:", productId, purchase1,delivery1);
            this.state.selectedProductpurchase =purchase1;
            this.state.selectedProductdelivery=delivery1;

            console.log("history state",this.state)

            this.updateDashboard('producthistory')

        } catch (error) {
            console.error("Error fetching move history:", error);
        }

    }


    onclickwarehouse=()=>{
        console.log("hello bharathikannan ware")
        this.state.warehouse=true
        this.state.rack=false
        this.state.bin=false
        
    }
    onclickracks=()=>{
        console.log("hello bharathikannan racks")
        this.state.warehouse=false
        this.state.rack=true
        this.state.bin=false
    }
    onclicknewbin=()=>{
        console.log("hello bharathikannan bin  ")
        this.state.warehouse=false
        this.state.rack=false
        this.state.bin=true
    }
    onclickProductHistory = () => {
        const target = document.getElementById("productHistoryTarget");
        if (target) {
            this.state.others=false
            target.classList.add("productHistoryTarget");
            if (!this.state.productHistoryInstance) {
             mount(ProductHistory, target );
             this.state.productHistoryInstance = true; // Mark as mounted
            console.log("the updated state",this.state)
            }
        } else {
            console.error("Target element not found for mounting ProductHistory.");
        }
    };

    backtohomeinventory = ()=>{
        location.reload(); // Reload the page
    }


    updateDashboard=(dashboard) =>{
        console.log("iam coming",dashboard)
        this.state.activeDashboard = dashboard;
        this.state.currentDashboard = dashboard;

        if (this.state.currentDashboard != 'existingbin'){
            this.state.activebinconfig=false
        }

        // Push the current state to history
        history.pushState({ activeDashboard: dashboard }, null, null);

        console.log("Updated Dashboard:", this.state.currentDashboard);
    }

    // productviewpage=(e)=> {
    //     const domainFilter = [['type', '=', 'product']]; // Example: Show only physical products
    //     try {
    //         this.env.services.action.doAction({
    //             type: 'ir.actions.act_window',
    //             name: _t("Filtered Product List"),
    //             res_model: 'product.template',
    //             domain: domainFilter,
    //             views: [[false, 'kanban'], [false, 'form']],
    //             view_mode: 'kanban',
    //             target: 'current',
    //         });
    //     } catch (error) {
    //         console.error("Error opening filtered Product List view:", error);
    //     }
    // }
    


}
HomePageInventory.template = "homePageInventory";
registry.category("actions").add("home_page_inventory", HomePageInventory);




