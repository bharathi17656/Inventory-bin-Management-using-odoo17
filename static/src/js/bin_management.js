/** @odoo-module **/
/**
 * @module inventory_management.bin_management
 * @description This module handles the warehouse management.
 */
import { Component, onWillStart, onMounted, useEffect,useRef,useState } from "@odoo/owl";
import { session } from "@web/session";
import { loadJS } from '@web/core/assets'
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { jsonrpc } from "@web/core/network/rpc_service";
import { _t } from "@web/core/l10n/translation";




export class ExistingBinManagement extends Component {
    setup() {
        this.state = useState({
            warehouse_list:[],
            child_list:[],
            rack_list:[],
            product_list:[],
            parent:0,
            child:0,
            rack_name:0,
           location_id:0,
            bin_details: [],
            row: 0,
            col: 0,
            total_bin: 0,
            grid:"1fr"
        });

        this.onWarehouseChange = this.onWarehouseChange.bind(this);
        this.onWarehouseChildChange = this.onWarehouseChildChange.bind(this);
        this.onchangeproduct = this.onchangeproduct.bind(this);

        onWillStart(async () => {
            // await this.getWarehouselist();
            await this.getChildWarehouselist();
            await this.getproductlist(); 
        
    })


        useEffect(() => {
            const columns = parseInt(this.state.col, 10) || 1;  // Ensure col is a number and fallback to 1
            this.state.grid = Array(columns).fill('1fr').join(' ');
            console.log("---------------------?state",this.state)
        });
    

        this.binContainerRef = useRef("binContainer");

        // Watch for changes in row and col to update total_bin and bin_details
        useEffect(() => {
            this.state.total_bin = this.state.row * this.state.col;
            this.updateBinDetails();
            this.updateGridColumns();
        }, () => [this.state.row, this.state.col]); // Recalculate when row or col changes
    }

    async getWarehouselist() {
        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.warehouse',
                method: 'get_existing_warehouse',
                args: [[]],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {},
            });
    
            if (result && Array.isArray(result)) {
                // Only set the state if result is an array
                this.state.warehouse_list = result;
                console.log("Warehouse list:", this.state.warehouse_list);
            } else {
                console.error("Unexpected data format from parent :", result);
            }
        } catch (error) {
            console.error("Error fetching warehouse parent :", error);
        }
    }
    

    async getracklist(child){
        try{
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.storage.category',
                method: 'get_rack_list',
                args: [[]],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {
                    num:child
                },
            });
    
            if (result && Array.isArray(result)) {
                // Only set the state if result is an array
                this.state.rack_list = result;
                console.log("rack list:", this.state.rack_list);
            } else {
                console.error("Unexpected data format from child :", result);
            }
        } catch (error) {
            console.error("Error fetching warehouse child :", error);
        }
    }

    onWarehouseChange = (event)=> {
        if (event && event.target) {
        
            const selectedParent = parseInt(event.target.value, 10);
      
            if(selectedParent != 'select'){



              
                
                this.state.parent = selectedParent
                console.log("current with parent name ",this.state.parent)
                this.getChildWarehouselist(selectedParent)

            }
            
            
        } else {
            console.error("Event or target is undefined");
        }
    }

    onWarehouseChildChange = (event)=> {
        if (event && event.target) {
        
            const selectedchild = parseInt(event.target.value, 10);
      
            if(selectedchild != 'select'){

                
                this.state.child = selectedchild
                console.log("current with child name ",this.state.child)
                this.getracklist(selectedchild)

             

            }
            
            
        } else {
            console.error("Event or target is undefined");
        }
    }

    onrackChange = (event)=> {
        if (event && event.target) {
        
            const selectedrack = parseInt(event.target.value, 10);
      
            if(selectedrack != 'select'){

                
                this.state.rack_name = selectedrack
                console.log("current with rack name ",this.state.rack_name)
                console.log(" current state ",this.state)

                this.get_bin_details(selectedrack)

             

            }
            
            
        } else {
            console.error("Event or target is undefined");
        }
    }

    
    
    async get_bin_details(data){

        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.location.details',
                method: 'get_bin_details',
                args: [data],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {
                   
                },
            });
            console.log("bin details in  result:",result);
    
            if (result.length >0) {
                // Only set the state if result is an array
                
               
                const { col,grid_name,row} = result[0]
                this.state.col=col
                this.state.row=row
                this.state.grid=grid_name

                console.log("bin details in  states:",this.state);

                this.get_bin_list(data)
            } else {
                console.error("Unexpected data format from bin details:", result);
            }
        } catch (error) {
            console.error("Error fetching bin details:", error);
        }

    }
    
    async get_bin_list(data){
            
        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.location',
                method: 'get_bin_list_record',
                args: [[]],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {
                   data:data
                },
            });
            console.log("bin list in  result:",result);
    
            if (result.length >0) {
                // Only set the state if result is an array
                
               
                this.state.bin_details = result

                console.log("bin details in  states:",this.state);

              
            } else {
                console.error("Unexpected data format from bin details:", result);
            }
        } catch (error) {
            console.error("Error fetching bin details:", error);
        }
    }


    async getChildWarehouselist(data) {
        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.warehouse',
                method: 'get_existing_warehouse',
                args: [[]],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {
                    parent : data
                },
            });
    
            if (result && Array.isArray(result)) {
                // Only set the state if result is an array
                this.state.child_list = result;
                console.log("Warehouse child:", this.state.child_list);
            } else {
                console.error("Unexpected data format from child parent:", result);
            }
        } catch (error) {
            console.error("Error fetching warehouse child:", error);
        }
    }

    updateBinDetails() {
        // Generate bin details based on total_bin, row, and col values
        const bins = [];
        for (let i = 1; i <= this.state.total_bin; i++) {
            bins.push({ id: i, name: `Bin ${i}`, row: Math.ceil(i / this.state.col), col: i % this.state.col || this.state.col , bin_available: true});
        }
        this.state.bin_details = bins;
        console.log("------------------bin row,col",bins)
    }

    updateGridColumns() {
        // Set grid-template-columns dynamically based on col value
        if (this.binContainerRef.el) {
            this.binContainerRef.el.style.gridTemplateColumns = `repeat(${this.state.col}, 1fr)`;
        }
    }

    clearBins() {
        this.state.warehouse_list = '';
        this.state.rack_name = '';
        this.state.row = 0;
        this.state.col = 0;
        this.state.total_bin = 0;
        this.state.bin_details = [];
    }

    

    async getproductlist() {
        try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.location',
                method: 'get_existing_products',
                args: [[]],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {
                },
            });
    
            if (result && Array.isArray(result)) {
                // Only set the state if result is an array
                this.state.product_list = result;
                console.log("product list:", this.state.product_list);
            } else {
                console.error("Unexpected error in format:", result);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }
   

    onchangeproduct =(event, proid)=> {
        if (event && event.target) {
            const selectProduct = parseInt(event.target.value, 10);
      
            if(selectProduct != 'select'){
              
                
                this.state.bin_details = this.state.bin_details.map((data)=>{
                    if (data.id == proid){
                       return {
                        ...data,
                        product_id:selectProduct
                       }
                    }


                console.log("========================Product addded state", this.state)
                    return data
                })
    
                console.log('-----------event',{id:proid,productname:selectProduct})

                console.log("updated with parent name ",this.state.bin_details)

            }
            
            
        } else {
            console.error("Event or target is undefined");
        }
    }
    async updateRecordDetails(){

        const data=this.state.bin_details
        console.log("------------------------ details of update needed", data)

        try{
        
        const result = await jsonrpc('/web/dataset/call_kw', {
            model: 'stock.location',
            method: 'update_bin_details',
            args: [[],data],  // Add an empty array as `args` to avoid the IndexError
            kwargs: { },
        });
        console.log("================================>update needed my account ",result)
        if (result) {
            // Only set the state if result is an array
            console.log("================================>update bin count ",result)

        } else {
            console.error("Unexpected error in result:", result);
        }

    
} catch (error) {
    console.error("Error fetching products:", error);
} 


        
    }

    // async updatebin(){


        
    // }

    recordcreation(){

        try {

            this.state.bin_details.map( async (data)=>{
                const para1={
                    company_id: 1,
                    name:data.name, 
                    location_id:this.state.location_id,
                    order_id:data.id,
                    bin_row:data.row,
                    bin_col:data.col,
                    usage: 'internal',
                    product_id:data.product_id,
                    storage_category_id:this.state.rack_name,
                    bin_available:data.bin_available,
                    scrap_location: false, 
                    return_location: false, 
                    replenish_location: false, 
                    cyclic_inventory_frequency: 0, 
                    comment: false,
                    active: true

                }

                

                console.log("------------------------>record creating para1",para1)

                const result = await jsonrpc('/web/dataset/call_kw', {
                    model: 'stock.location',
                    method: 'create',
                    args: [[para1]],  // Add an empty array as `args` to avoid the IndexError
                    kwargs: {
                       
                    },
                });
        
                if (result) {
                    // Only set the state if result is an array
                    console.log("================================>result",result)

                    const ruleway = {
                        package_type_ids: [],
                        product_id:data.product_id,
                        location_in_id:this.state.location_id,
                        location_out_id:result[0],
                        storage_category_id:this.state.rack_name
                    }

            

                    const result1= await jsonrpc('/web/dataset/call_kw', {
                        model: 'stock.putaway.rule',
                        method: 'createrule',
                        args: [ruleway],  // Add an empty array as `args` to avoid the IndexError
                        kwargs: {
                           
                        },
                    });


                    console.log("Record created Successfully and putaway rule also updated ",result1);


                } else {
                    console.error("Unexpected error in result:", result);
                }

            })

            // this.createRecordDetails()


            
        } catch (error) {
            console.error("Error fetching products:", error);
        }


    }



    
}

ExistingBinManagement.template = "ExistingBinManagement";
registry.category("actions").add("owl.existing_bin_management", ExistingBinManagement);



