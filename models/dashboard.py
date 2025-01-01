
from odoo import models, fields, api, _
from odoo.exceptions import UserError
from datetime import datetime, timedelta
from openpyxl import Workbook
from io import BytesIO
import base64
import logging


class Stockpicking(models.Model):
    _inherit='stock.picking'


    customer_id=fields.Many2one('our_customer')
    vendor_id = fields.Many2one('our_vendor')
    vehicle_no =fields.Char(string='Vehicle Number')
    recieved_emp=fields.Char(string='Recieved Employee')



    def export_inward_data(self, data):
        try:
            # Check if data is empty
            if not data:
                raise ValueError("No data to export.")

            # Convert data into a format suitable for a DataFrame (if needed, here we assume data is already in correct format)

            # Create an in-memory buffer for the Excel file
            output = BytesIO()

            # Create a workbook and add a worksheet
            workbook = Workbook()
            worksheet = workbook.active
            worksheet.title = "Delivery Data"

            # Define the headers for the columns
            headers = ['Move Date', 'Product Name', 'From Partner1', 'Received By', 'Rack Name', 'To Location', 'Quantity In']
            worksheet.append(headers)

            # Iterate through the data and write to Excel
            for item in data:
                row = [
                    item.get("move_date", ""),
                    item.get("product_name", {}).get("en_US", ""),
                    item.get("from_partner1", ""),
                    item.get("received_by", ""),
                    item.get("rack_name", ""),
                    item.get("to_location", ""),
                    item.get("qty_in", 0),
                ]
                worksheet.append(row)

            # Save the workbook to the in-memory file buffer
            workbook.save(output)

            # Seek to the beginning of the BytesIO buffer
            output.seek(0)

            # Encode the file as base64 for Odoo attachment
            file_data = base64.b64encode(output.getvalue()).decode()

            # Create an attachment for the file in Odoo
            attachment = self.env['ir.attachment'].create({
                'name': 'Inward Data.xlsx',
                'type': 'binary',
                'datas': file_data,
                'store_fname': 'inward_data.xlsx',
                'mimetype': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            })

            # Return an action to allow the user to download the file
            return {
                'type': 'ir.actions.act_url',
                'url': '/web/content/%s?download=true' % attachment.id,
                'target': 'self',
            }

        except Exception as e:
            # Log the error
            logging.error(f"Error exporting delivery data: {str(e)}")
            return {
                'type': 'ir.actions.act_window',
                'name': 'Error',
                'view_mode': 'form',
                'res_model': 'res.users',
                'target': 'new',
                'context': {'message': f"Error exporting delivery data: {str(e)}"}
            }
        



    def export_outward_data(self, data):
        try:
            # Check if data is empty
            if not data:
                raise ValueError("No data to export.")

            # Convert data into a format suitable for a DataFrame (if needed, here we assume data is already in correct format)

            # Create an in-memory buffer for the Excel file
            output = BytesIO()

            # Create a workbook and add a worksheet
            workbook = Workbook()
            worksheet = workbook.active
            worksheet.title = "Delivery Data"

            # Define the headers for the columns
            headers = ['Move Date', 'Product Name', 'Bin Location','Customer Name', 'Received Employee By', 'Issued By', 'Vehicle Number', 'Qty Out']
            worksheet.append(headers)

            # Iterate through the data and write to Excel
            for item in data:
                row = [
                    item.get("move_date", ""),
                    item.get("product_name", {}).get("en_US", ""),
                    item.get("from_location",""),
                    item.get("to_partner1", ""),
                    item.get("recieved_emp", ""),
                    item.get("issued_by", ""),
                    item.get("vehicle", ""),
                    item.get("qty_out", 0),
                ]
                worksheet.append(row)

            # Save the workbook to the in-memory file buffer
            workbook.save(output)

            # Seek to the beginning of the BytesIO buffer
            output.seek(0)

            # Encode the file as base64 for Odoo attachment
            file_data = base64.b64encode(output.getvalue()).decode()

            # Create an attachment for the file in Odoo
            attachment = self.env['ir.attachment'].create({
                'name': 'Delivery Data.xlsx',
                'type': 'binary',
                'datas': file_data,
                'store_fname': 'delivery_data.xlsx',
                'mimetype': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            })

            # Return an action to allow the user to download the file
            return {
                'type': 'ir.actions.act_url',
                'url': '/web/content/%s?download=true' % attachment.id,
                'target': 'self',
            }

        except Exception as e:
            # Log the error
            logging.error(f"Error exporting delivery data: {str(e)}")
            return {
                'type': 'ir.actions.act_window',
                'name': 'Error',
                'view_mode': 'form',
                'res_model': 'res.users',
                'target': 'new',
                'context': {'message': f"Error exporting delivery data: {str(e)}"}
            }





class OurDashboard(models.Model):
    _inherit='stock.move'


    customer_id=fields.Many2one('our_customer')
    vendor_id = fields.Many2one('our_vendor')
    vehicle_no =fields.Char(string='Vehicle Number')
    recieved_emp=fields.Char(string='Recieved Employee')


    @api.model
    def get_inventory_category(self):

        query="select id,name,parent_id from ir_module_category"


        self.env.cr.execute(query)  # Pass the interval dynamically
        results = self.env.cr.dictfetchall()
        group_id = []


        for i in results:
            print("This is my i of list:", i)
            # Access the 'en_US' key in the 'name' dictionary
            if i['name'].get('en_US') == 'Inventory'  or i['name'].get('en_US') == 'Purchase' :
                if i['parent_id'] is not None:
                    group_id.append({'id': i['id'], 'name': i['name']})


        
        # If no matching category is found, return a message or an empty dictionary
        return group_id
        




    def get_aged_products(self, period_days):
        """
        Fetch aged product stock for a given period.
        :param period_days: Number of days to filter stock (e.g., 7, 30, 60)
        :return: List of aged product stock records
        """
        query = """
        SELECT
            sq.id AS quant_id,
            pt.id AS product_id,
            pt.name AS product_name,
            sq.quantity AS available_quantity,
            sl.id AS bin_id,
            sl.name AS bin_name,
            sq.create_date AS quant_create_date,
            sm.date AS last_stock_move_date,
            COALESCE(sm.date, sq.create_date) AS stock_date,
            EXTRACT(DAY FROM NOW() - COALESCE(sm.date, sq.create_date)) AS age_in_days
        FROM
            stock_quant sq
        JOIN
            product_product pp ON sq.product_id = pp.id
        JOIN
            product_template pt ON pp.product_tmpl_id = pt.id
        JOIN
            stock_location sl ON sq.location_id = sl.id
        LEFT JOIN
            stock_move sm ON sq.product_id = sm.product_id AND sq.location_id = sm.location_dest_id
        WHERE
            sl.usage = 'internal' -- Ensure we only get bins in internal locations
            AND sq.quantity > 0 -- Only include bins with stock
            AND COALESCE(sm.date, sq.create_date) >= NOW() - INTERVAL %s
        ORDER BY
            sl.id, age_in_days DESC;
        """
        self.env.cr.execute(query, (f'{period_days} days',))  # Pass the interval dynamically
        results = self.env.cr.dictfetchall()
        return results
    



    def get_delivery_count_by_product(self, period):
        """
        Fetch total delivery count by product for a dynamic period.
        :param period: A string representing the time period (e.g., 'last_7_days', 'last_30_days')
        :return: List of dictionaries containing product ID, name, and total quantity delivered.
        """
        # Define the date ranges dynamically based on the given period
        today = datetime.today()
        date_ranges = {
            '7': (today - timedelta(days=7), today),
            '30': (today - timedelta(days=30), today),
            '60': (today - timedelta(days=60), today),
            '90': (today - timedelta(days=90), today),
            '180': (today - timedelta(days=180), today),
            '365': (today - timedelta(days=365), today),
        }

        # Fallback for custom periods
        if not period or period not in date_ranges:
            raise ValueError("Invalid period. Valid options: last_7_days, last_30_days, etc.")

        # Get the start and end dates for the selected period
        start_date, end_date = date_ranges[period]
        start_date = start_date.strftime('%Y-%m-%d 00:00:00')
        end_date = end_date.strftime('%Y-%m-%d 23:59:59')

        # SQL query
        query = """
        SELECT 
            pp.id AS product_id,
            pt.name AS product_name,
            SUM(sm.product_uom_qty) AS total_qty_out -- Total quantity delivered per product
        FROM 
            stock_move sm
        JOIN 
            product_product pp ON sm.product_id = pp.id
        JOIN 
            product_template pt ON pp.product_tmpl_id = pt.id
        JOIN 
            stock_location sl ON sm.location_id = sl.id -- Source location
        JOIN 
            stock_location sld ON sm.location_dest_id = sld.id -- Destination location
        WHERE 
            sm.state = 'done' -- Only consider completed stock moves
            AND sl.usage = 'internal' -- Source is internal
            AND sld.usage = 'customer' -- Destination is customer
            AND sm.date BETWEEN %s AND %s -- Dynamic date range
        GROUP BY 
            pp.id, pt.name -- Group by product ID and name
        ORDER BY 
            total_qty_out DESC; -- Order by the total quantity in descending order
        """

        # Execute the query
        self.env.cr.execute(query, (start_date, end_date))
        results = self.env.cr.dictfetchall()

        print("this is the delivery product top dashboard",results)

        return results
    




    def get_purchase_count_by_product(self, period):
        """
        Fetch total purchased quantity by product for a dynamic period.
        :param period: A string representing the time period (e.g., 'last_7_days', 'last_30_days')
        :return: List of dictionaries containing product ID, name, and total purchased quantity.
        """
        # Define the date ranges dynamically based on the given period
        today = datetime.today()
        date_ranges = {
            '7': (today - timedelta(days=7), today),
            '30': (today - timedelta(days=30), today),
            '60': (today - timedelta(days=60), today),
            '90': (today - timedelta(days=90), today),
            '180': (today - timedelta(days=180), today),
            '365': (today - timedelta(days=365), today),
        }

        # Fallback for custom periods
        if not period or period not in date_ranges:
            raise ValueError("Invalid period. Valid options: last_7_days, last_30_days, etc.")

        # Get the start and end dates for the selected period
        start_date, end_date = date_ranges[period]
        start_date = start_date.strftime('%Y-%m-%d 00:00:00')
        end_date = end_date.strftime('%Y-%m-%d 23:59:59')

        # SQL query
        query = """
        SELECT 
            pp.id AS product_id,
            pt.name AS product_name,
            SUM(sm.product_uom_qty) AS total_qty_in -- Total quantity purchased per product
        FROM 
            stock_move sm
        JOIN 
            product_product pp ON sm.product_id = pp.id
        JOIN 
            product_template pt ON pp.product_tmpl_id = pt.id
        JOIN 
            stock_location sl ON sm.location_id = sl.id -- Source location (supplier)
        JOIN 
            stock_location sld ON sm.location_dest_id = sld.id -- Destination location (internal)
        WHERE 
            sm.state = 'done' -- Only consider completed stock moves
            AND sl.usage = 'supplier' -- Source is supplier
            AND sld.usage = 'internal' -- Destination is internal
            AND sm.date BETWEEN %s AND %s -- Dynamic date range
        GROUP BY 
            pp.id, pt.name -- Group by product ID and name
        ORDER BY 
            total_qty_in DESC; -- Order by total quantity in descending order
        """

        # Execute the query with parameters
        self.env.cr.execute(query, (start_date, end_date))
        results = self.env.cr.dictfetchall()

        return results




class ProductTemplate (models.Model):
    _inherit='product.template'

    baseimage =fields.Char(string="Image Base64")



    def get_uom_list(self):
        query =' select id,name from uom_uom order by id asc'

        self.env.cr.execute(query)
        return self.env.cr.dictfetchall()
    

    def getproduct_gategory(self):
        query = ' select id, name from product_category order by id asc '

        self.env.cr.execute(query)
        return self.env.cr.dictfetchall()
    

    def getproductdetails(self):

        query="select id,name,active,uom_id,categ_id,default_code,list_price,baseimage from product_template order by id asc"

        self.env.cr.execute(query)
        return self.env.cr.dictfetchall()
    

    def getupdateproductlist(self,id):

        query=f""" 
            select  pt.id,
                    pt.name as product_name,
                    pt.default_code as code,
                    pt.uom_id ,
                    uo.name,
                    pt.list_price as price,
                    pt.baseimage as image


            from product_template pt
            join uom_uom uo on pt.uom_id = uo.id

            where pt.id={id}  """
        
        self.env.cr.execute(query)
        results = self.env.cr.dictfetchall()
        print("this is the product details ",id,results)
        return results