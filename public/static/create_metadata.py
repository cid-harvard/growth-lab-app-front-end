#!/usr/bin/env python3
import csv
import os

def create_metadata():
    # Initialize dictionary to store parent names and colors
    parent_colors = {}
    
    # Read the nodes CSV file
    csv_file_path = "public/space-viewer/industry_space_nodes.csv"
    print(f"Reading {csv_file_path}...")
    
    with open(csv_file_path, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if 'parent_name' in row and row['parent_name'] and 'color' in row and row['color']:
                parent_name = row['parent_name']
                color = row['color']
                parent_colors[parent_name] = color
    
    print(f"Found {len(parent_colors)} unique parent categories")
    
    # Create metadata CSV file
    metadata_file_path = "public/space-viewer/industry_space_metadata.csv"
    print(f"Creating {metadata_file_path}...")
    
    with open(metadata_file_path, 'w', newline='') as file:
        writer = csv.writer(file)
        # Write header
        writer.writerow(["name", "color"])
        # Write data rows
        for name, color in parent_colors.items():
            writer.writerow([name, color])
    
    print(f"Metadata saved to: {os.path.abspath(metadata_file_path)}")

if __name__ == "__main__":
    create_metadata() 