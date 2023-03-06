using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
    {
        private readonly StoreContext _context;
        public GenericRepository(StoreContext context)
        {
            _context = context;
        }

        public async Task<T> GetByIdAsync(int id)
        {
            return await _context.Set<T>().FindAsync(id);
        }
        public async Task<IReadOnlyList<T>> ListAllAsync()
        {
            return await _context.Set<T>().ToListAsync();
        }

        public async Task<T> GetEntityWithSpec(ISpecification<T> spec)
        {
            IQueryable<T> query = _context.Set<T>().AsQueryable();

            if (spec.Criteria != null)
            {
                query = _context.Set<T>().AsQueryable().Where(spec.Criteria);
            }

            query = spec.Includes.Aggregate(query,
            (current, include) => current.Include(include));

            return await query.FirstOrDefaultAsync();
        }

        public async Task<IReadOnlyList<T>> ListAsync(ISpecification<T> spec)
        {
            IQueryable<T> query = GetQuery(_context.Set<T>().AsQueryable(),spec);
            query = spec.Includes.Aggregate(query, (current, include) => current.Include(include));
            return await query.ToListAsync();
        }

        public async Task<int> CountAsync(ISpecification<T> spec)
        {
            IQueryable<T> query = GetQuery(_context.Set<T>().AsQueryable(),spec);
            query = spec.Includes.Aggregate(query, (current, include) => current.Include(include));
            return await query.CountAsync();
        }

        IQueryable<T> GetQuery(IQueryable<T> inputQuery,
            ISpecification<T> spec)
        {
            var query = inputQuery;

            if (spec.Criteria != null)
            {
                query = query.Where(spec.Criteria);
            }

            if (spec.OrderBy != null)
            {
                query = query.OrderBy(spec.OrderBy);
            }

            if (spec.OrderByDescending != null)
            {
                query = query.OrderByDescending(spec.OrderByDescending);
            }

            if (spec.isPagingEnabled)
            {
                query = query.Skip(spec.Skip).Take(spec.Take);
            }

            query = spec.Includes.Aggregate(query, (current, include) => current.Include(include));

            return query;
        }
    }
}