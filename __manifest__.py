
{
    'name': 'Inventory Management',
    'version': '0.1',
    'category': 'Inventory',
    'sequence': -1,
    'summary': 'Manage Inventory Warehouse Bins Managements',
    
    'depends': [
      'base', 'base_setup','stock','purchase'
    ],
    'data': [
        'security/inventory_bin_group.xml',
        'security/ir.model.access.csv',
       
        'views/inventory_management.xml',
        "views/stock_warehouse.xml",
        'views/our_customer_vendor_views.xml',
    ],
   
    'installable': True,
    'application': True,
   
    'assets': {
        'web.assets_backend': [
            'inventory_management_master/static/src/js/component/purchase/purchase_inventory.js',
            'inventory_management_master/static/src/js/component/purchase/purchase_inventory.xml',
            'inventory_management_master/static/src/js/component/purchase/purchase_inventory.css',
            'inventory_management_master/static/src/js/component/**/**/*.js',
            'inventory_management_master/static/src/js/component/**/**/*.xml',
            'inventory_management_master/static/src/js/component/**/**/*.css',
            'inventory_management_master/static/src/js/**/*.js',
            'inventory_management_master/static/src/xml/**/*.xml',
            'inventory_management_master/static/src/js/search_product.js',
             'inventory_management_master/static/src/xml/search_product.xml',
              'inventory_management_master/static/src/js/product_history.js',
             'inventory_management_master/static/src/xml/product_history.xml',
              'inventory_management_master/static/src/js/home_page_inventory.js',
               'inventory_management_master/static/src/js/main_page_inventory.js',
             'inventory_management_master/static/src/xml/home_page_inventory.xml',
             'inventory_management_master/static/src/js/warehouse_management.js',
             'inventory_management_master/static/src/xml/warehouse_management.xml',
             'inventory_management_master/static/src/js/bin_management.js',
             'inventory_management_master/static/src/xml/bin_management.xml',
            'inventory_management_master/static/src/js/new_bin_management.js',
             'inventory_management_master/static/src/xml/new_bin_management.xml',
            'inventory_management_master/static/src/js/rack_management.js',
             'inventory_management_master/static/src/xml/rack_management.xml',
              'inventory_management_master/static/src/css/style.css',
               'inventory_management_master/static/src/css/style1.css',
            'inventory_management_master/static/src/css/css/**/*.css',
                'inventory_management_master/static/src/css/css/**/*.scss',
             'inventory_management_master/static/src/js/component/settings_inventory.js',
        ],
       
    },
    'license': 'LGPL-3',
}
