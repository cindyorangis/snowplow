/**
 * Seed Data Script for Snow Removal Service Admin Dashboard
 */

import { createClient } from '@supabase/supabase-js'

// Supabase client configuration
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.error(
    'Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env.local file'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Sample services for snow removal
const services = [
  {
    name: 'Snow Plowing',
    description:
      'Professional snow plowing for residential and commercial properties',
    base_price: 150.0,
    duration_minutes: 120,
    is_active: true,
  },
  {
    name: 'Snow Shoveling',
    description: 'Manual snow shoveling for driveways and walkways',
    base_price: 75.0,
    duration_minutes: 60,
    is_active: true,
  },
  {
    name: 'Ice Melting',
    description: 'Application of ice melt products for safe walking surfaces',
    base_price: 50.0,
    duration_minutes: 45,
    is_active: true,
  },
  {
    name: 'Salting',
    description: 'Road salting services for ice prevention',
    base_price: 80.0,
    duration_minutes: 90,
    is_active: true,
  },
  {
    name: 'Complete Winter Package',
    description:
      'Full winter maintenance including plowing, shoveling, and salting',
    base_price: 300.0,
    duration_minutes: 240,
    is_active: true,
  },
  {
    name: 'Emergency Snow Removal',
    description: '24/7 emergency snow removal service',
    base_price: 200.0,
    duration_minutes: 180,
    is_active: true,
  },
]

// Sample customers
const customers = [
  {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '555-0101',
    address_line1: '123 Maple Street',
    address_line2: 'Apt 4B',
    city: 'Springfield',
    state: 'IL',
    zip_code: '62701',
    notes: 'Prefers early morning service',
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '555-0102',
    address_line1: '456 Oak Avenue',
    address_line2: '',
    city: 'Springfield',
    state: 'IL',
    zip_code: '62702',
    notes: 'Commercial property - parking lot included',
  },
  {
    name: 'Mike Wilson',
    email: 'mike.wilson@email.com',
    phone: '555-0103',
    address_line1: '789 Pine Road',
    address_line2: '',
    city: 'Chicago',
    state: 'IL',
    zip_code: '60601',
    notes: 'Weekend service only',
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '555-0104',
    address_line1: '321 Elm Street',
    address_line2: 'Unit 12',
    city: 'Naperville',
    state: 'IL',
    zip_code: '60540',
    notes: 'Large property with multiple driveways',
  },
  {
    name: 'Robert Brown',
    email: 'robert.brown@email.com',
    phone: '555-0105',
    address_line1: '654 Cedar Lane',
    address_line2: '',
    city: 'Aurora',
    state: 'IL',
    zip_code: '60505',
    notes: 'Prefers eco-friendly ice melt products',
  },
]

// Sample service requests
const serviceRequests = [
  {
    customer_name: 'John Smith',
    customer_email: 'john.smith@email.com',
    customer_phone: '555-0101',
    service_id: null,
    address_line1: '123 Maple Street',
    address_line2: 'Apt 4B',
    city: 'Springfield',
    state: 'IL',
    zip_code: '62701',
    notes: 'First snowfall of the season',
    status: 'pending',
    priority: 'high',
    estimated_price: 150.0,
    scheduled_date: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    customer_name: 'Sarah Johnson',
    customer_email: 'sarah.j@email.com',
    customer_phone: '555-0102',
    service_id: null,
    address_line1: '456 Oak Avenue',
    address_line2: '',
    city: 'Springfield',
    state: 'IL',
    zip_code: '62702',
    notes: 'Commercial property - parking lot needs attention',
    status: 'confirmed',
    priority: 'normal',
    estimated_price: 300.0,
    scheduled_date: new Date(Date.now() + 172800000).toISOString(),
  },
  {
    customer_name: 'Mike Wilson',
    customer_email: 'mike.wilson@email.com',
    customer_phone: '555-0103',
    service_id: null,
    address_line1: '789 Pine Road',
    address_line2: '',
    city: 'Chicago',
    state: 'IL',
    zip_code: '60601',
    notes: 'Weekend service requested',
    status: 'pending',
    priority: 'normal',
    estimated_price: 75.0,
    scheduled_date: new Date(Date.now() + 259200000).toISOString(),
  },
  {
    customer_name: 'Emily Davis',
    customer_email: 'emily.davis@email.com',
    customer_phone: '555-0104',
    service_id: null,
    address_line1: '321 Elm Street',
    address_line2: 'Unit 12',
    city: 'Naperville',
    state: 'IL',
    zip_code: '60540',
    notes: 'Large property with multiple driveways',
    status: 'in_progress',
    priority: 'urgent',
    estimated_price: 300.0,
    actual_price: 285.0,
    scheduled_date: new Date(Date.now() - 86400000).toISOString(),
    completed_date: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    customer_name: 'Robert Brown',
    customer_email: 'robert.brown@email.com',
    customer_phone: '555-0105',
    service_id: null,
    address_line1: '654 Cedar Lane',
    address_line2: '',
    city: 'Aurora',
    state: 'IL',
    zip_code: '60505',
    notes: 'Prefers eco-friendly ice melt products',
    status: 'pending',
    priority: 'normal',
    estimated_price: 80.0,
    scheduled_date: new Date(Date.now() + 432000000).toISOString(),
  },
]

// Sample technicians
const technicians = [
  {
    user_id: null,
    full_name: 'Tom Anderson',
    phone_number: '555-0201',
    license_number: 'SNOW-12345',
    vehicle_type: 'truck',
    vehicle_plate: 'SNOW001',
    skills: ['plowing', 'shoveling', 'salting'],
    is_available: true,
    hourly_rate: 45.0,
  },
  {
    user_id: null,
    full_name: 'Lisa Martinez',
    phone_number: '555-0202',
    license_number: 'SNOW-23456',
    vehicle_type: 'van',
    vehicle_plate: 'SNOW002',
    skills: ['shoveling', 'salting', 'ice_melting'],
    is_available: true,
    hourly_rate: 40.0,
  },
  {
    user_id: null,
    full_name: 'David Chen',
    phone_number: '555-0203',
    license_number: 'SNOW-34567',
    vehicle_type: 'truck',
    vehicle_plate: 'SNOW003',
    skills: ['plowing', 'salting'],
    is_available: false,
    hourly_rate: 50.0,
  },
  {
    user_id: null,
    full_name: 'Jennifer Wilson',
    phone_number: '555-0204',
    license_number: 'SNOW-45678',
    vehicle_type: 'van',
    vehicle_plate: 'SNOW004',
    skills: ['shoveling', 'plowing', 'ice_melting'],
    is_available: true,
    hourly_rate: 42.0,
  },
  {
    user_id: null,
    full_name: 'Michael Brown',
    phone_number: '555-0205',
    license_number: 'SNOW-56789',
    vehicle_type: 'truck',
    vehicle_plate: 'SNOW005',
    skills: ['plowing', 'shoveling', 'salting', 'ice_melting'],
    is_available: true,
    hourly_rate: 55.0,
  },
]

// Sample service assignments - use null IDs initially, will be populated after seeding
const serviceAssignments = [
  {
    service_request_id: null,
    technician_id: null,
    status: 'in_progress',
    notes: 'Completed snow removal for large property',
  },
  {
    service_request_id: null,
    technician_id: null,
    status: 'assigned',
    notes: 'Scheduled for tomorrow morning',
  },
]

// Sample analytics data
const analytics = [
  {
    metric_name: 'total_revenue',
    metric_value: 12500.0,
    period: 'monthly',
  },
  {
    metric_name: 'active_requests',
    metric_value: 15,
    period: 'daily',
  },
  {
    metric_name: 'technicians_available',
    metric_value: 4,
    period: 'daily',
  },
  {
    metric_name: 'total_customers',
    metric_value: 1250,
    period: 'monthly',
  },
  {
    metric_name: 'completed_requests',
    metric_value: 45,
    period: 'weekly',
  },
  {
    metric_name: 'average_response_time_minutes',
    metric_value: 25.5,
    period: 'weekly',
  },
  {
    metric_name: 'customer_satisfaction_score',
    metric_value: 4.8,
    period: 'monthly',
  },
]

async function seedDatabase() {
  console.log('🌱 Starting database seeding process...\n')

  try {
    // Seed services
    console.log('📋 Seeding services...')
    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .insert(services)
      .select()

    if (servicesError) throw servicesError
    console.log(`   ✅ Inserted ${servicesData.length} services\n`)

    // Seed customers
    console.log('👥 Seeding customers...')
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .insert(customers)
      .select()

    if (customersError) throw customersError
    console.log(`   ✅ Inserted ${customersData.length} customers\n`)

    // Seed service requests
    console.log('📝 Seeding service requests...')
    const { data: requestsData, error: requestsError } = await supabase
      .from('service_requests')
      .insert(serviceRequests)
      .select()

    if (requestsError) throw requestsError
    console.log(`   ✅ Inserted ${requestsData.length} service requests\n`)

    // Seed technicians
    console.log('👷 Seeding technicians...')
    const { data: techniciansData, error: techniciansError } = await supabase
      .from('technicians')
      .insert(technicians)
      .select()

    if (techniciansError) throw techniciansError
    console.log(`   ✅ Inserted ${techniciansData.length} technicians\n`)

    // Now we have IDs, update service assignments with actual IDs
    console.log('🔗 Seeding service assignments...')
    const serviceRequestIds = requestsData.map((r) => r.id)
    const technicianIds = techniciansData.map((t) => t.id)

    const assignments = [
      {
        service_request_id: serviceRequestIds[3],
        technician_id: technicianIds[0],
        status: 'in_progress',
        notes: 'Completed snow removal for large property',
      },
      {
        service_request_id: serviceRequestIds[0],
        technician_id: technicianIds[1],
        status: 'assigned',
        notes: 'Scheduled for tomorrow morning',
      },
    ]

    const { error: assignmentsError } = await supabase
      .from('service_assignments')
      .insert(assignments)
      .select()

    if (assignmentsError) throw assignmentsError
    console.log(`   ✅ Inserted ${assignments.length} service assignments\n`)

    // Seed analytics
    console.log('📊 Seeding analytics data...')
    const { error: analyticsError } = await supabase
      .from('analytics')
      .insert(analytics)
      .select()

    if (analyticsError) throw analyticsError
    console.log(`   ✅ Inserted ${analytics.length} analytics records\n`)

    console.log('✨ Database seeding completed successfully!\n')
    console.log('Summary:')
    console.log(`   - Services: ${servicesData.length}`)
    console.log(`   - Customers: ${customersData.length}`)
    console.log(`   - Service Requests: ${requestsData.length}`)
    console.log(`   - Technicians: ${techniciansData.length}`)
    console.log(`   - Service Assignments: ${assignments.length}`)
    console.log(`   - Analytics: ${analytics.length}`)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run the seed function
seedDatabase()
