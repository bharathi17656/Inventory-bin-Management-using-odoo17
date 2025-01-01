
/** @odoo-module **/
import { Component, useState, mount,useEffect, useRef,onWillStart,xml } from "@odoo/owl";
import { session } from "@web/session";
import { loadJS } from '@web/core/assets'
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { jsonrpc } from "@web/core/network/rpc_service";
import { _t } from "@web/core/l10n/translation";


export class SearchProduct extends Component{

    setup(){
        this.state=useState({
			table:0,
			from_date:'',
			to_date:'',  
            max_date:"",
			location:"",
			product:"",
			vendor:"",
			product_list:[],
			vendor_list:[],
			bin_location_list:[],
			tabledata:[],
			currentPage: 1, // The current page being viewed
			pageSize: 10, // Number of rows per page
			totalPages: 1, // Total number of pages
			row_number:1

        })




		const today = new Date().toISOString().split("T")[0];
		const currentYearStart = new Date().getFullYear();// January 1st of the current year

        this.state.from_date = `${currentYearStart}-01-01 00:00:00`;
        this.state.to_date = `${today} 23:59:59`;
        this.state.max_date = `${today} 23:59:59`;
        console.log("--------------------this is my state",this.state)

		onWillStart(async ()=>{
			await this.get_filter_dropdown()
			await this.get_purchase_filtered_history()
		})
    }



	exportdatatoexcel=async()=>{
		const result=await jsonrpc('/web/dataset/call_kw', {
			model: 'stock.picking',
			method: 'export_inward_data',
			args: [[],this.state.tabledata],  // Add an empty array as `args` to avoid the IndexError
			kwargs: {
			   
			},
		});


		if (result && result.url) {
			// Create a temporary anchor tag to trigger the download
			const link = document.createElement('a');
			link.href = result.url; // The URL returned by the backend
			link.download = 'Delivery_Data.xlsx'; // Name of the file to download
			link.click(); // Simulate click to trigger the download
		  } else {
			alert('Error: No URL returned for the Excel file.');
		  }
		} 

	




	updatePagination = () => {
		const startIndex = (this.state.currentPage - 1) * this.state.pageSize;
		const endIndex = startIndex + this.state.pageSize;
		this.state.filteredTableData = this.state.tabledata.slice(startIndex, endIndex);
		this.state.totalPages = Math.ceil(this.state.tabledata.length / this.state.pageSize);
	};
	
	changePage = (newPage) => {
		if (newPage > 0 && newPage <= this.state.totalPages) {
			this.state.currentPage = newPage;
			this.updatePagination();
		}
	};

	get_filter_dropdown= async()=>{
		
	try	{
		const vendor = await jsonrpc('/web/dataset/call_kw', {
			model: 'res.partner',
			method: 'getVendor_id',
			args: [[]],  // Add an empty array as `args` to avoid the IndexError
			kwargs: {
			   
			},
		});


		const product = await jsonrpc('/web/dataset/call_kw', {
			model: 'stock.quant',
			method: 'getproduct_details',
			args: [[]],  // Add an empty array as `args` to avoid the IndexError
			kwargs: {
			   
			},
		});


		const location = await jsonrpc('/web/dataset/call_kw', {
			model: 'res.partner',
			method: 'getbin_location',
			args: [[]],  // Add an empty array as `args` to avoid the IndexError
			kwargs: {
			   
			},
		});

		this.state.bin_location_list=location
		this.state.product_list=product
		this.state.vendor_list=vendor
	}
	catch{
		console.log("error get from fetch dropdown for filter")
	}

	}




	onFilterChange = (e) => {
		const value = e.target.value; // Get the value of the changed input
		const name = e.target.name;  // Get the name of the input to identify the field
	
		if (name === 'from_date') {
			if(this.state.from_date != value){
				this.state.from_date =`${value} 00:00:00`;  // Set from_date in state
			}
			
		} else if (name === 'to_date') {
			if(this.state.to_date != value){
				this.state.to_date = `${value} 23:59:59`; 
			}
		} else if (name === 'vendor') {
			if(this.state.vendor != value){
			this.state.vendor = value; // Set vendor in state
			}
		} else if (name === 'product') {
			if(this.state.product != value){
			this.state.product = value; // Set product in state
			}
		} else if (name === 'bin') {
			if(this.state.location != value){
			this.state.location = value; // Set bin (location) in state
			}
		}
		else{
			console.log("event not handle currectly")
		}



		

		if ( this.state.from_date <= this.state.max_date && this.state.to_date <= this.state.max_date){
			if ( this.state.from_date <= this.state.to_date){
				this.get_purchase_filtered_history()

			}
			else{
				alert('Please Select From Date less than End Date')
			}
		

		}
		else{
			alert("U Can't Select From And Last Date in Future")
		}

		console.log("--------------------Updated state:", this.state);
	};



	get_purchase_filtered_history = async ()=>{
		const filter_data = {
			start_date:this.state.from_date,
			end_date:this.state.to_date,
			product_id:this.state.product,
			location_id:this.state.location,
			partner_id:this.state.vendor
		}
		try {
            const result = await jsonrpc('/web/dataset/call_kw', {
                model: 'stock.quant',
                method: 'get_product_purchase_move_history',
                args: [[],filter_data],  // Add an empty array as `args` to avoid the IndexError
                kwargs: {},
            });
			

			this.state.tabledata = [...result]; // Use spread operator to ensure reactivity
			this.state.table =1
			this.state.currentPage = 1; // Reset to the first page
			this.updatePagination(); // Apply pagination

			console.log('my fetched purchase result', result)
			console.log("-----------------------------my state",this.state)
			console.log(this.state.tabledata.length)
		}
		catch {
			alert('error got from purchase filter ')
		}

	}




	


	
    

}
SearchProduct.template = "search_product";
registry.category("actions").add("product_search", SearchProduct);



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




