/** @odoo-module **/
/**
 * @module inventory_management.warehouse_management
 * @description This module handles the warehouse management.
 */
import { Component, onWillStart, onMounted, useRef,useState ,useEffect} from "@odoo/owl";
import { session } from "@web/session";
import { loadJS } from '@web/core/assets'
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { jsonrpc } from "@web/core/network/rpc_service";
import { _t } from "@web/core/l10n/translation";


// export class WarehouseManagement extends Component {
//     setup() {
//         // State for tracking customer records
//         this.state = useState({
//             warehouse: [],
//             serach_name:"",
//             warehouse_list:[],
//             product_location:[],
//             count:[],
//             level:0,
//             message:0
//         });
       
//         this.removebox = this.removebox.bind(this);
//         this.onWarehouseChange = this.onWarehouseChange.bind(this);

//         onMounted(() => {
//             if (this.state.message) {
//                 setTimeout(() => {
//                     // Set message to null
//                     this.state.message = null;
                    
//                     // Trigger a re-render by slightly modifying a different state property
//                     this.state.level += 0;  // Dummy update to trigger reactivity
//                 }, 7000);
//             }
//         });
//         onWillStart(async () => {
//             await this.getWarehouselist();
//             await this.addCustomer();
        
//     })
        

       
//     }

    
 
//     onWarehouseChange = (event,boxId)=> {
//         if (event && event.target) {

//             if(event.target.value != 'select'){

//             const selectedParent = parseInt(event.target.value, 10);
      
           
              
                
//                 this.state.warehouse = this.state.warehouse.map((data)=>{
//                     if (data.id == boxId){
//                        return {
//                         ...data,
//                         parent_name:selectedParent
//                        }
//                     }
//                     return data
//                 })
    
//                 console.log('-----------event',{id:boxId,parentname:selectedParent})

//                 console.log("updated with parent name ",this.state.warehouse)

//             }
//             else{
//                 this.state.warehouse = this.state.warehouse.map((data)=>{
//                     if (data.id == boxId){
//                        return {
//                         ...data,
//                         parent_name:null
//                        }
//                     }
                    
//                     return data
//                 })
    
           

//                 console.log("updated with parent name ",this.state.warehouse)

//             }


            
            
//         } else {
//             console.error("Event or target is undefined");
//         }
//     }
    

    


//     addCustomer() {
//         this.state.level += 1;
//         this.state.warehouse.push({
//             id: this.state.level,
//             name: "",
//             shortname: ""
//         });
//         console.log("Warehouse Add List:", this.state.warehouse);
//     }
    
    
    
//     removebox = (id) => {
//         // Filter out the warehouse with the specified ID
//         this.state.warehouse = this.state.warehouse.filter(warehouse => warehouse.id !== id);
        
//         // Reassign sequential IDs
//         this.state.warehouse.forEach((warehouse, index) => {
//             warehouse.id = index + 1;  // Set IDs as 1, 2, 3, etc.
//         });
    
//         // Reset `level` to the new length of `warehouse`
//         this.state.level = this.state.warehouse.length;
        
//         console.log("Updated warehouse list after removal:", this.state.warehouse);
//     }

    

//      getWarehouselist=async()=> {
//         try {
//             const result = await jsonrpc('/web/dataset/call_kw', {
//                 model: 'stock.warehouse',
//                 method: 'get_existing_warehouse',
//                 args: [[]],  // Add an empty array as `args` to avoid the IndexError
//                 kwargs: {},
//             });
    
//             if (result && Array.isArray(result)) {
//                 // Only set the state if result is an array
//                 this.state.warehouse_list = result;
//                 console.log("Warehouse list:", this.state.warehouse_list);
//             } else {
//                 console.error("Unexpected data format from get_existing_warehouse:", result);
//             }
//         } catch (error) {
//             console.error("Error fetching warehouse list:", error);
//         }
//     }
    

//      submitwarehouse = async()=> {
//         const warehouseData = this.state.warehouse;
    
//         try {
//             // Loop over each warehouse entry in the state
//             for (const value of warehouseData) {
//                 const warehouseRecord = {
//                     name: value.name,
//                     parent_warehouse: value.parent_name,
//                     active: true,
//                     code: value.shortname,
//                     partner_id: 1,
//                     reception_steps: 'one_step',
//                     delivery_steps: 'ship_only',
//                     buy_to_resupply: true,
//                     resupply_wh_ids: []
//                 };
                
//                 // Make an async JSON-RPC call to create a new record in `stock.warehouse`
//                 const result = await jsonrpc('/web/dataset/call_kw', {
//                     model: 'stock.warehouse',
//                     method: 'create',
//                     args: [warehouseRecord],  // Empty dictionary for single record creation
//                     kwargs: {
//                         // vals: warehouseRecord, // Single record
//                     },
//                 });

//                 this.state.message = ` ${warehouseRecord.name} - Warehouse Created Successfully:`;


//                 console.log("Created Warehouse Record ID:", result);


//             }
            
//             // Optionally, clear the form or provide success feedback here
//             console.log("All warehouses submitted successfully.");
//             this.state.message="Warehouse Created Successfully"

//             console.log("-----------------------state",this.state)
//             this.setmessage();
    
//         } catch (error) {
//             console.error("Error creating warehouse records:", error);
//         }
//     }
    
//   setmessage=()=> {
//     setTimeout(()=>{
//         console.log("-----------------------srt timeout")
//         this.state.message=0
//     },5000)
//   }
    
// }
// WarehouseManagement.template = "WarehouseManagement";
// registry.category("actions").add("owl.warehouse_management", WarehouseManagement);




export class WarehouseManagement extends Component {
    setup() {
        this.state = useState({
            warehouse: [],
            warehouse_list: [],
            level: 0,
            message: 0,
        });

        this.addCustomer = this.addCustomer.bind(this);
        this.removebox = this.removebox.bind(this);
        this.onWarehouseChange = this.onWarehouseChange.bind(this);
        this.validateWarehouse = this.validateWarehouse.bind(this);
        this.submitwarehouse = this.submitwarehouse.bind(this);

        onMounted(() => {
            if (this.state.message) {
                setTimeout(() => {
                    this.state.message = 0;
                }, 7000);
            }
        });

        onWillStart(async () => {
            await this.getWarehouselist();
            this.addCustomer(); // Add a default warehouse form row
        });
    }

    async getWarehouselist() {
        try {
            const result = await jsonrpc("/web/dataset/call_kw", {
                model: "stock.warehouse",
                method: "get_existing_warehouse",
                args: [[]],
                kwargs: {},
            });

            if (result && Array.isArray(result)) {
                this.state.warehouse_list = result;
            } else {
                console.error("Unexpected data format from get_existing_warehouse:", result);
            }
        } catch (error) {
            console.error("Error fetching warehouse list:", error);
        }
    }

    addCustomer() {
        this.state.level += 1;
        this.state.warehouse.push({
            id: this.state.level,
            name: "",
            shortname: "",
            parent_name: null,
            errors: {},
        });
    }

    removebox(id) {
        this.state.warehouse = this.state.warehouse.filter((warehouse) => warehouse.id !== id);
        this.state.level = this.state.warehouse.length;
    }

    onWarehouseChange(event, boxId) {
        if (event && event.target) {
            const selectedParent = event.target.value === "select" ? null : parseInt(event.target.value, 10);
            this.state.warehouse = this.state.warehouse.map((data) => {
                if (data.id === boxId) {
                    return { ...data, parent_name: selectedParent };
                }
                return data;
            });
        } else {
            console.error("Event or target is undefined");
        }
    }

    validateWarehouse(warehouse) {
        const errors = {};
        if (!warehouse.name || warehouse.name.trim() === "") {
            errors.name = "Please enter the warehouse name.";
        }
        if (!warehouse.shortname || warehouse.shortname.trim() === "") {
            errors.shortname = "Please enter the short name.";
        }
        if (warehouse.parent_name === null) {
            errors.parent_name = "Please select a parent warehouse.";
        }
        return errors;
    }

    async submitwarehouse() {
        let hasError = false;

        // Validate each warehouse entry
        this.state.warehouse = this.state.warehouse.map((warehouse) => {
            const errors = this.validateWarehouse(warehouse);
            if (Object.keys(errors).length > 0) {
                hasError = true;
            }
            return { ...warehouse, errors };
        });

        if (hasError) {
            console.log("Validation errors:", this.state.warehouse);
            return; // Stop submission if validation fails
        }

        try {
            for (const warehouse of this.state.warehouse) {
                const warehouseRecord = {
                    name: warehouse.name,
                    parent_warehouse: warehouse.parent_name,
                    active: true,
                    code: warehouse.shortname,
                    partner_id: 1,
                    reception_steps: "one_step",
                    delivery_steps: "ship_only",
                    buy_to_resupply: true,
                    resupply_wh_ids: [],
                };

                await jsonrpc("/web/dataset/call_kw", {
                    model: "stock.warehouse",
                    method: "create",
                    args: [warehouseRecord],
                });

                this.state.message = `${warehouseRecord.name} - Warehouse Created Successfully.`;
            }

            console.log("All warehouses submitted successfully.");
            setTimeout(() => {
                this.state.message = 0;
            }, 5000);
        } catch (error) {
            console.error("Error creating warehouse records:", error);
        }
    }
}

WarehouseManagement.template = "WarehouseManagement";
registry.category("actions").add("owl.warehouse_management", WarehouseManagement);