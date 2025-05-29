import kagglehub
import pandas as pd
import glob
from datetime import datetime, timedelta

from constants import color_map, color_group_map, product_group_map, product_subgroup_map, size_group_map, age_group_map, activity_group_map

def import_data():
    path = kagglehub.dataset_download("tienanh2003/sales-and-inventory-snapshot-data")
    print("Path to dataset files:", path)

    return path

def generate_calendar(start_year=2022, end_year=2023):
    weeks = []
    current = datetime(start_year, 1, 3)  # Start from first Monday

    while current.year <= end_year:
        year_week = f'{current.isocalendar().year}{current.isocalendar().week:02d}'
        start_date = current
        end_date = current + timedelta(days=6)
        weeks.append({
            'YearWeek': year_week,
            'Start Date': start_date,
            'End Date': end_date
        })
        current += timedelta(weeks=1)

    return pd.DataFrame(weeks)

def preprocess_data(path):
    full_path = path + "/InventoryAndSale_snapshot_data/"
    sales_files = glob.glob(full_path + "Sales_snapshot_data/TT*_split_1.xlsx")

    sales_df_list = [pd.read_excel(f) for f in sales_files]
    sales_df = pd.concat(sales_df_list, ignore_index=True)

    retail_price = pd.read_excel(full_path + "MasterData/Retail_price.xlsx")
    cogs = pd.read_excel(full_path + "MasterData/COGS.xlsx")
    product_master = pd.read_excel(full_path + "MasterData/Productmaster.xlsx")
    calendar_df = generate_calendar()
    calendar_df['YearWeek'] = calendar_df['YearWeek'].astype(int)

    sales_df = sales_df.merge(calendar_df[['YearWeek', 'Start Date']],
                          left_on='week', right_on='YearWeek', how='left')
    sales_df = sales_df.drop(columns=['YearWeek', 'month', 'week'])

    # Retail price
    retail_price = retail_price.drop(columns=['Unnamed: 0', 'index'])
    retail_price = retail_price.rename(columns={'amount': 'retail_price'})

    # COGS
    cogs = cogs.drop(columns=['index'])
    cogs = cogs.rename(columns={'amount': 'cost_price'})
    
    grouped_sales = sales_df.groupby(['product_id', 'Start Date', 'distribution_channel_code', 'channel_id']).agg({
        'sold_quantity': 'sum',
        'net_price': 'mean',
        'cost_price': 'mean',
        'customer_id': 'nunique'
    }).reset_index()

    latest_retail = retail_price.loc[
        retail_price.groupby('product_id')['valid_from'].idxmax()
    ].reset_index(drop=True)

    latest_cogs = cogs.loc[
        cogs.groupby('product_id')['valid_from'].idxmax()
    ].reset_index(drop=True)

    grouped_sales = grouped_sales.merge(latest_retail[['product_id', 'retail_price']],
                          on='product_id' ,how='left')

    grouped_sales = grouped_sales.merge(latest_cogs[['product_id', 'cost_price']],
                          on='product_id' ,how='left').rename(columns={'cost_price': 'cogs'})

    product_master = product_master.drop(['Unnamed: 0', 'image_copyright','cost_price','mold_code','heel_height','code_lock','option', 'product_syle_color','product_syle', 'vendor_name','price_group'], axis=1)

    product_master['color'] = product_master['color'].map(color_map)
    product_master['color_group'] = product_master['color_group'].map(color_group_map)
    product_master['product_group'] = product_master['product_group'].map(product_group_map)
    product_master['detail_product_group'] = product_master['detail_product_group'].map(product_subgroup_map)
    product_master['size_group'] = product_master['size_group'].map(size_group_map)
    product_master['age_group'] = product_master['age_group'].map(age_group_map)
    product_master['activity_group'] = product_master['activity_group'].map(activity_group_map)

    sales_with_products = pd.merge(grouped_sales, product_master, on='product_id', how='left')

    VND_TO_THB = 0.0015

    price_cols = ['net_price', 'retail_price', 'cost_price','cogs', 'listing_price']
    for col in price_cols:
        if col in sales_with_products.columns:
            sales_with_products[f'{col}'] = sales_with_products[col] * VND_TO_THB

    sales_with_products['discount'] = sales_with_products['retail_price'] - sales_with_products['net_price']
    sales_with_products['discount'] = sales_with_products['discount'].where(sales_with_products['discount'] >= 0, 0)

    sales_with_products.to_csv('./dataset/processed/sales_with_products.csv', index=False)
    latest_retail.to_csv('./dataset/processed/latest_retail.csv', index=False)
    latest_cogs.to_csv('./dataset/processed/latest_cogs.csv', index=False)
    product_master.to_csv('./dataset/processed/product_master.csv', index=False)
    calendar_df.to_csv('./dataset/processed/calendar_df.csv', index=False)
    
if __name__ == "__main__":
    path = import_data()
    preprocess_data(path)