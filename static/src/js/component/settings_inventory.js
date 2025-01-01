/** @odoo-module **/

import { Component, onWillStart, onMounted, useRef,useState ,useEffect,xml} from "@odoo/owl";
import { session } from "@web/session";
import { loadJS } from '@web/core/assets'
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { jsonrpc } from "@web/core/network/rpc_service";
import { _t } from "@web/core/l10n/translation";
import {RackManagement} from '../rack_management';
import { WarehouseManagement } from "../warehouse_management";
import {NewBinManagement} from '../new_bin_management'


const MenuInventory = xml `<!-- Page wrapper/Container Section -->




            <div  class="menu-bar-warehouse">
                
               
                <a href="#" t-on-click="onclickrack" class="menu-item-warehouse">
                    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24"  class="menu-item-svg-warehouse">
                        <path d="m23,0h-5c-1.654,0-3,1.346-3,3v4H2V1c0-.553-.448-1-1-1S0,.447,0,1v22c0,.553.448,1,1,1s1-.447,1-1v-2h20v2c0,.553.448,1,1,1s1-.447,1-1V1c0-.553-.448-1-1-1Zm-6,3c0-.552.449-1,1-1h4v5h-5V3ZM2,15c0-.552.449-1,1-1h3c.551,0,1,.448,1,1v4H2v-4Zm12,4h-5v-4c0-.552.449-1,1-1h3c.551,0,1,.448,1,1v4Zm2,0v-4c0-1.654-1.346-3-3-3h-3c-.768,0-1.469.29-2,.766-.531-.476-1.232-.766-2-.766h-3c-.351,0-.687.061-1,.172v-3.172h20v10h-6Z"/>
                    </svg>
                    <span class="span-value-warehouse">Racks</span>
                </a>
                 <a href="#" t-on-click="onclickbin" class="menu-item-warehouse">
                    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" class="menu-item-svg-warehouse">
                        <path d="M19.5,16c0,.553-.447,1-1,1h-2c-.553,0-1-.447-1-1s.447-1,1-1h2c.553,0,1,.447,1,1Zm4.5-1v5c0,2.206-1.794,4-4,4H4c-2.206,0-4-1.794-4-4v-5c0-2.206,1.794-4,4-4h1V4C5,1.794,6.794,0,9,0h6c2.206,0,4,1.794,4,4v7h1c2.206,0,4,1.794,4,4ZM7,11h10V4c0-1.103-.897-2-2-2h-6c-1.103,0-2,.897-2,2v7Zm-3,11h7V13H4c-1.103,0-2,.897-2,2v5c0,1.103,.897,2,2,2Zm18-7c0-1.103-.897-2-2-2h-7v9h7c1.103,0,2-.897,2-2v-5Zm-14.5,0h-2c-.553,0-1,.447-1,1s.447,1,1,1h2c.553,0,1-.447,1-1s-.447-1-1-1ZM14,5c0-.553-.447-1-1-1h-2c-.553,0-1,.447-1,1s.447,1,1,1h2c.553,0,1-.447,1-1Z"/>
                    </svg>
                    <span class="span-value-warehouse">Bins</span>
                </a>
            </div>
            <div>
              
                <t t-if="state.menu== 'bin'" >
                <NewBinManagement/>
                </t>
                <t t-if="state.menu== 'rack'" >
                <RackManagement/>
                </t>
            </div>






                     

                 
                
                                `

export class SettingsInventory extends Component {
    static template=MenuInventory
    static components={NewBinManagement,RackManagement,WarehouseManagement}
    setup() {
        this.state=useState({
           menu:"rack"
        })
        console.log("my settings inventory state",this.state)
    }

    onclickwarehouse=()=>{
        this.state.menu='warehouse'
        console.log("my settings inventory state",this.state)
    }
    onclickbin=()=>{
        this.state.menu='bin'
        console.log("my settings inventory state",this.state)
    }
    onclickrack=()=>{
        this.state.menu='rack'
        console.log("my settings inventory state",this.state)
    }
  
    
}


registry.category("actions").add("SettingsInventory", SettingsInventory);



